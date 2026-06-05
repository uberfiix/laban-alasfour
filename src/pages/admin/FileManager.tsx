import { useCallback, useEffect, useRef, useState } from "react";
import { 
  Upload, 
  Folder, 
  FileImage, 
  FileVideo, 
  Box, 
  FileText,
  Trash2,
  Download,
  Eye,
  Search,
  Grid3X3,
  List,
  RefreshCw,
  FolderPlus,
  Copy,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { getErrorMessage } from "@/lib/errors";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

interface UploadedFile {
  id: string;
  file_name: string;
  original_name: string;
  file_path: string;
  bucket_id: string;
  file_size: number | null;
  mime_type: string | null;
  file_type: string;
  metadata: Json;
  created_at: string;
}

interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

const BUCKETS = [
  { id: 'product-assets', name: 'صور المنتجات', icon: FileImage },
  { id: '3d-models', name: 'النماذج ثلاثية الأبعاد', icon: Box },
  { id: 'design-files', name: 'ملفات التصميم', icon: FileText },
];

const FILE_TYPES = [
  { value: 'all', label: 'جميع الملفات' },
  { value: 'image', label: 'الصور' },
  { value: '3d-model', label: 'النماذج ثلاثية الأبعاد' },
  { value: 'design', label: 'ملفات التصميم' },
  { value: 'video', label: 'الفيديوهات' },
  { value: 'document', label: 'المستندات' },
];

function getFileType(mimeType: string, fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  
  if (mimeType?.startsWith('image/')) return 'image';
  if (mimeType?.startsWith('video/')) return 'video';
  if (['obj', '3ds', 'fbx', 'glb', 'gltf', 'usdz', 'dae', 'stl', 'max', 'blend'].includes(ext)) return '3d-model';
  if (['dwg', 'dxf', 'ifc', 'rvt', 'skp'].includes(ext)) return 'design';
  if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'json', 'txt'].includes(ext)) return 'document';
  
  return 'document';
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function normalizeFileSearchValue(value: string): string {
  return value
    .toLowerCase()
    .replace(/[._/-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getFileIcon(fileType: string) {
  switch (fileType) {
    case 'image': return FileImage;
    case 'video': return FileVideo;
    case '3d-model': return Box;
    default: return FileText;
  }
}

export default function FileManager() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [selectedBucket, setSelectedBucket] = useState('product-assets');
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<UploadedFile | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("uploaded_files")
        .select("*")
        .eq("bucket_id", selectedBucket)
        .order("created_at", { ascending: false });

      if (filterType !== 'all') {
        query = query.eq("file_type", filterType);
      }

      const { data, error } = await query;
      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error("Error fetching files:", error);
      toast.error("حدث خطأ في تحميل الملفات");
    } finally {
      setLoading(false);
    }
  }, [filterType, selectedBucket]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setUploading(true);
    const progressList: UploadProgress[] = [];

    for (const file of Array.from(selectedFiles)) {
      progressList.push({
        fileName: file.name,
        progress: 0,
        status: 'uploading'
      });
    }
    setUploadProgress([...progressList]);

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      try {
        // Update progress
        progressList[i].progress = 30;
        setUploadProgress([...progressList]);

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from(selectedBucket)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        progressList[i].progress = 70;
        setUploadProgress([...progressList]);

        // Get public URL
        const { data: urlData } = supabase.storage
          .from(selectedBucket)
          .getPublicUrl(filePath);

        // Determine file type
        const fileType = getFileType(file.type, file.name);

        // Save metadata to database
        const { error: dbError } = await supabase
          .from("uploaded_files")
          .insert({
            file_name: fileName,
            original_name: file.name,
            file_path: filePath,
            bucket_id: selectedBucket,
            file_size: file.size,
            mime_type: file.type,
            file_type: fileType,
            metadata: {
              lastModified: file.lastModified,
              publicUrl: urlData.publicUrl
            }
          });

        if (dbError) throw dbError;

        progressList[i].progress = 100;
        progressList[i].status = 'completed';
        setUploadProgress([...progressList]);

      } catch (error: unknown) {
        console.error("Upload error:", error);
        progressList[i].status = 'error';
        progressList[i].error = getErrorMessage(error);
        setUploadProgress([...progressList]);
      }
    }

    setUploading(false);
    fetchFiles();
    
    // Clear progress after delay
    setTimeout(() => {
      setUploadProgress([]);
    }, 3000);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    const successCount = progressList.filter(p => p.status === 'completed').length;
    if (successCount > 0) {
      toast.success(`تم رفع ${successCount} ملف بنجاح`);
    }
  }

  async function handleDelete() {
    if (!fileToDelete) return;

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(fileToDelete.bucket_id)
        .remove([fileToDelete.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from("uploaded_files")
        .delete()
        .eq("id", fileToDelete.id);

      if (dbError) throw dbError;

      toast.success("تم حذف الملف بنجاح");
      fetchFiles();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("حدث خطأ في حذف الملف");
    } finally {
      setDeleteConfirmOpen(false);
      setFileToDelete(null);
    }
  }

  function getPublicUrl(file: UploadedFile): string {
    const { data } = supabase.storage
      .from(file.bucket_id)
      .getPublicUrl(file.file_path);
    return data.publicUrl;
  }

  function copyUrl(file: UploadedFile) {
    const url = getPublicUrl(file);
    navigator.clipboard.writeText(url);
    setCopiedUrl(file.id);
    toast.success("تم نسخ الرابط");
    setTimeout(() => setCopiedUrl(null), 2000);
  }

  const normalizedSearchQuery = normalizeFileSearchValue(searchQuery);

  const filteredFiles = files.filter((file) => {
    if (!normalizedSearchQuery) {
      return true;
    }

    const searchableText = normalizeFileSearchValue([
      file.original_name,
      file.file_name,
      file.file_path,
      file.bucket_id,
    ].join(' '));

    return searchableText.includes(normalizedSearchQuery);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">إدارة الملفات</h1>
          <p className="text-muted-foreground mt-1">
            رفع وإدارة الصور والنماذج ثلاثية الأبعاد وملفات التصميم
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => fetchFiles()} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4 ml-2" />
            رفع ملفات
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileUpload}
            accept="image/*,video/*,.obj,.3ds,.fbx,.glb,.gltf,.usdz,.dae,.stl,.max,.blend,.dwg,.dxf,.ifc,.rvt,.skp,.pdf,.json,.txt"
          />
        </div>
      </div>

      {/* Upload Progress */}
      <AnimatePresence>
        {uploadProgress.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">جاري الرفع...</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {uploadProgress.map((item, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="truncate">{item.fileName}</span>
                      <span className={
                        item.status === 'completed' ? 'text-green-500' :
                        item.status === 'error' ? 'text-red-500' :
                        'text-muted-foreground'
                      }>
                        {item.status === 'completed' ? 'تم' :
                         item.status === 'error' ? 'خطأ' :
                         `${item.progress}%`}
                      </span>
                    </div>
                    <Progress 
                      value={item.progress} 
                      className={item.status === 'error' ? 'bg-red-100' : ''}
                    />
                    {item.error && (
                      <p className="text-xs text-red-500">{item.error}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Bucket Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
              {BUCKETS.map((bucket) => {
                const Icon = bucket.icon;
                return (
                  <Button
                    key={bucket.id}
                    variant={selectedBucket === bucket.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedBucket(bucket.id)}
                    className="whitespace-nowrap"
                  >
                    <Icon className="h-4 w-4 ml-2" />
                    {bucket.name}
                  </Button>
                );
              })}
            </div>

            <div className="flex-1" />

            {/* Search & Filters */}
            <div className="flex gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="بحث باسم الملف أو المجلد..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-9"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FILE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Files Grid/List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filteredFiles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Folder className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">لا توجد ملفات</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 ml-2" />
              رفع ملفات
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredFiles.map((file) => {
            const Icon = getFileIcon(file.file_type);
            const isImage = file.file_type === 'image';
            const publicUrl = getPublicUrl(file);

            return (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group relative"
              >
                <Card className="overflow-hidden hover:ring-2 ring-primary transition-all cursor-pointer">
                  <div 
                    className="aspect-square bg-muted relative"
                    onClick={() => {
                      setSelectedFile(file);
                      setPreviewOpen(true);
                    }}
                  >
                    {isImage ? (
                      <img
                        src={publicUrl}
                        alt={file.original_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    
                    {/* Hover Actions */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button size="icon" variant="secondary" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="secondary" 
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyUrl(file);
                        }}
                      >
                        {copiedUrl === file.id ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button 
                        size="icon" 
                        variant="destructive" 
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFileToDelete(file);
                          setDeleteConfirmOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-2">
                    <p className="text-xs truncate" title={file.original_name}>
                      {file.original_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.file_size)}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <Card>
          <div className="divide-y">
            {filteredFiles.map((file) => {
              const Icon = getFileIcon(file.file_type);
              const publicUrl = getPublicUrl(file);

              return (
                <div
                  key={file.id}
                  className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="w-12 h-12 bg-muted rounded flex items-center justify-center overflow-hidden">
                    {file.file_type === 'image' ? (
                      <img
                        src={publicUrl}
                        alt={file.original_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Icon className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.original_name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{formatFileSize(file.file_size)}</span>
                      <span>•</span>
                      <span>{new Date(file.created_at).toLocaleDateString('ar-SA')}</span>
                    </div>
                  </div>
                  <Badge variant="secondary">{file.file_type}</Badge>
                  <div className="flex gap-1">
                    <Button 
                      size="icon" 
                      variant="ghost"
                      onClick={() => {
                        setSelectedFile(file);
                        setPreviewOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost"
                      onClick={() => copyUrl(file)}
                    >
                      {copiedUrl === file.id ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <a href={publicUrl} download target="_blank" rel="noopener noreferrer">
                      <Button size="icon" variant="ghost">
                        <Download className="h-4 w-4" />
                      </Button>
                    </a>
                    <Button 
                      size="icon" 
                      variant="ghost"
                      onClick={() => {
                        setFileToDelete(file);
                        setDeleteConfirmOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedFile?.original_name}</DialogTitle>
          </DialogHeader>
          {selectedFile && (
            <div className="space-y-4">
              <div className="aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                {selectedFile.file_type === 'image' ? (
                  <img
                    src={getPublicUrl(selectedFile)}
                    alt={selectedFile.original_name}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : selectedFile.file_type === 'video' ? (
                  <video
                    src={getPublicUrl(selectedFile)}
                    controls
                    className="max-w-full max-h-full"
                  />
                ) : (
                  <div className="text-center">
                    {(() => {
                      const Icon = getFileIcon(selectedFile.file_type);
                      return <Icon className="h-24 w-24 text-muted-foreground mx-auto mb-4" />;
                    })()}
                    <p className="text-muted-foreground">معاينة غير متوفرة لهذا النوع من الملفات</p>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">الحجم:</span>
                  <span className="mr-2">{formatFileSize(selectedFile.file_size)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">النوع:</span>
                  <span className="mr-2">{selectedFile.mime_type || selectedFile.file_type}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">الرابط:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Input 
                      value={getPublicUrl(selectedFile)} 
                      readOnly 
                      dir="ltr"
                      className="text-xs"
                    />
                    <Button 
                      size="icon" 
                      variant="outline"
                      onClick={() => copyUrl(selectedFile)}
                    >
                      {copiedUrl === selectedFile.id ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <a 
                  href={getPublicUrl(selectedFile)} 
                  download 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button variant="outline">
                    <Download className="h-4 w-4 ml-2" />
                    تحميل
                  </Button>
                </a>
                <Button 
                  variant="destructive"
                  onClick={() => {
                    setFileToDelete(selectedFile);
                    setDeleteConfirmOpen(true);
                    setPreviewOpen(false);
                  }}
                >
                  <Trash2 className="h-4 w-4 ml-2" />
                  حذف
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف الملف "{fileToDelete?.original_name}" نهائياً. هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
