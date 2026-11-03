import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { translations } from '@/lib/translations';
import { useLanguage } from '@/contexts/LanguageContext';
import libraryService from '@/services/libraryService';

interface ShareResourceFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export const ShareResourceForm: React.FC<ShareResourceFormProps> = ({ onSuccess, onCancel }) => {
    const { language } = useLanguage();
    const t = translations[language];
    const [isUploading, setIsUploading] = useState(false);
    const [uploadData, setUploadData] = useState({
        title: '',
        category: 'notes' as const,
        school: '',
        file: null as File | null
    });

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploadData.file || !uploadData.title) {
            toast.error(t.library_toast_upload_fail);
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', uploadData.file);
        formData.append('title', uploadData.title);
        formData.append('category', uploadData.category);
        if (uploadData.school) formData.append('school', uploadData.school);

        try {
            await libraryService.uploadResource(formData);
            toast.success(t.library_toast_upload_success);
            onSuccess();
        } catch (error) {
            console.error('Upload failed:', error);
            toast.error(t.library_toast_upload_fail);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <>
            <DialogHeader>
                <DialogTitle className="text-2xl font-black tracking-tight">{t.library_upload_title}</DialogTitle>
                <DialogDescription>{t.library_upload_desc}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-6 pt-4">
                <div className="space-y-2">
                    <Label className="text-xs font-black uppercase text-muted-foreground tracking-widest">{t.library_label_title}</Label>
                    <Input
                        placeholder={t.library_placeholder_title}
                        value={uploadData.title}
                        onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                        className="h-11 rounded-xl"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs font-black uppercase text-muted-foreground tracking-widest">{t.library_label_category}</Label>
                    <select
                        className="w-full h-11 px-3 rounded-xl border border-input bg-background font-medium focus:ring-2 focus:ring-primary/20 transition-all"
                        value={uploadData.category}
                        onChange={(e) => setUploadData({ ...uploadData, category: e.target.value as any })}
                    >
                        <option value="notes">{t.library_category_notes}</option>
                        <option value="papers">{t.library_category_papers}</option>
                        <option value="books">{t.library_category_books}</option>
                        <option value="others">{t.library_category_others}</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <Label className="text-xs font-black uppercase text-muted-foreground tracking-widest">{t.library_label_school}</Label>
                    <Input
                        placeholder={t.library_placeholder_school}
                        value={uploadData.school}
                        onChange={(e) => setUploadData({ ...uploadData, school: e.target.value })}
                        className="h-11 rounded-xl"
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs font-black uppercase text-muted-foreground tracking-widest">File</Label>
                    <Input
                        type="file"
                        onChange={(e) => setUploadData({ ...uploadData, file: e.target.files?.[0] || null })}
                        className="h-11 rounded-xl py-2 cursor-pointer"
                        required
                    />
                </div>
                <DialogFooter className="pt-2 flex gap-2">
                    <Button type="button" variant="outline" onClick={onCancel} className="h-12 rounded-xl text-lg font-bold">
                        {t.cancel}
                    </Button>
                    <Button type="submit" disabled={isUploading} className="flex-1 h-12 rounded-xl text-lg font-bold">
                        {isUploading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                        {t.library_upload_btn}
                    </Button>
                </DialogFooter>
            </form>
        </>
    );
};
