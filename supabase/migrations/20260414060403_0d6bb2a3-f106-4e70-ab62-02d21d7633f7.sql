DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'app_role' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.app_role AS ENUM ('owner', 'operator', 'viewer');
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.is_active_internal_user(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = _user_id
      AND is_active = true
  );
$$;

INSERT INTO public.user_roles (user_id, role)
SELECT
  u.id,
  CASE u.role
    WHEN 'owner' THEN 'owner'::public.app_role
    WHEN 'operator' THEN 'operator'::public.app_role
    ELSE 'viewer'::public.app_role
  END AS role
FROM public.users u
ON CONFLICT (user_id, role) DO NOTHING;

DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Admins can manage products"
ON public.products
FOR ALL
TO public
USING (public.has_role(auth.uid(), 'owner'))
WITH CHECK (public.has_role(auth.uid(), 'owner'));

DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Admins can manage categories"
ON public.categories
FOR ALL
TO public
USING (public.has_role(auth.uid(), 'owner'))
WITH CHECK (public.has_role(auth.uid(), 'owner'));

DROP POLICY IF EXISTS "Admins can manage variants" ON public.product_variants;
CREATE POLICY "Admins can manage variants"
ON public.product_variants
FOR ALL
TO public
USING (public.has_role(auth.uid(), 'owner'))
WITH CHECK (public.has_role(auth.uid(), 'owner'));

DROP POLICY IF EXISTS "owners_manage_templates" ON public.notification_templates;
CREATE POLICY "owners_manage_templates"
ON public.notification_templates
FOR ALL
TO public
USING (public.has_role(auth.uid(), 'owner'))
WITH CHECK (public.has_role(auth.uid(), 'owner'));

DROP POLICY IF EXISTS "users_view_audit" ON public.audit_logs;
CREATE POLICY "users_view_audit"
ON public.audit_logs
FOR SELECT
TO public
USING (
  public.has_role(auth.uid(), 'owner')
  OR public.has_role(auth.uid(), 'operator')
);

DROP POLICY IF EXISTS "operators_manage_media" ON public.media_files;
CREATE POLICY "operators_manage_media"
ON public.media_files
FOR ALL
TO public
USING (
  public.has_role(auth.uid(), 'owner')
  OR public.has_role(auth.uid(), 'operator')
)
WITH CHECK (
  public.has_role(auth.uid(), 'owner')
  OR public.has_role(auth.uid(), 'operator')
);

DROP POLICY IF EXISTS "users_view_media" ON public.media_files;
CREATE POLICY "users_view_media"
ON public.media_files
FOR SELECT
TO public
USING (public.is_active_internal_user(auth.uid()));

DROP POLICY IF EXISTS "Admins can view sync logs" ON public.sync_logs;
CREATE POLICY "Admins can view sync logs"
ON public.sync_logs
FOR SELECT
TO public
USING (
  public.has_role(auth.uid(), 'owner')
  OR public.has_role(auth.uid(), 'operator')
);

DROP POLICY IF EXISTS "owner_all_users" ON public.users;
DROP POLICY IF EXISTS "user_sees_self" ON public.users;

CREATE POLICY "No direct access to users"
ON public.users
FOR SELECT
TO public
USING (false);

CREATE POLICY "No direct updates to users"
ON public.users
FOR UPDATE
TO public
USING (false)
WITH CHECK (false);

CREATE POLICY "No direct inserts to users"
ON public.users
FOR INSERT
TO public
WITH CHECK (false);

CREATE POLICY "No direct deletes to users"
ON public.users
FOR DELETE
TO public
USING (false);

DROP POLICY IF EXISTS "Owners can manage roles" ON public.user_roles;
CREATE POLICY "Owners can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'owner'))
WITH CHECK (public.has_role(auth.uid(), 'owner'));

DROP POLICY IF EXISTS "Admins can view roles" ON public.user_roles;
CREATE POLICY "Admins can view roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'owner')
  OR public.has_role(auth.uid(), 'operator')
);

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);