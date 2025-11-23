"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { downloadService, authService, DownloadRecord } from "@/lib/localStorageService";
import { Download, Trash2, FileText, FileJson, FileSpreadsheet, Calendar } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function DownloadsPage() {
    const [downloads, setDownloads] = useState<DownloadRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDownloads();
    }, []);

    const loadDownloads = () => {
        const session = authService.getSession();
        const userId = session?.phone.replace(/\+/g, '');
        const allDownloads = downloadService.getAll(userId);
        setDownloads(allDownloads);
        setLoading(false);
    };

    const handleDownload = (download: DownloadRecord) => {
        try {
            const blob = new Blob([download.fileContent], { type: download.mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = download.filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success("File downloaded successfully!");
        } catch (error) {
            console.error("Download error:", error);
            toast.error("Failed to download file");
        }
    };

    const handleDelete = (id: string) => {
        const session = authService.getSession();
        const userId = session?.phone.replace(/\+/g, '');
        downloadService.delete(id, userId);
        loadDownloads();
        toast.success("Download record deleted");
    };

    const handleClearAll = () => {
        if (confirm("Are you sure you want to clear all download history?")) {
            const session = authService.getSession();
            const userId = session?.phone.replace(/\+/g, '');
            downloadService.clear(userId);
            loadDownloads();
            toast.success("All downloads cleared");
        }
    };

    const getFileIcon = (format: string) => {
        switch (format) {
            case 'csv':
                return <FileText className="h-5 w-5 text-green-600" />;
            case 'json':
                return <FileJson className="h-5 w-5 text-yellow-600" />;
            case 'xlsx':
                return <FileSpreadsheet className="h-5 w-5 text-blue-600" />;
            default:
                return <FileText className="h-5 w-5" />;
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-muted-foreground">Loading downloads...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 min-h-screen">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
                <div>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        Downloads
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        View and manage your exported transaction files
                    </p>
                </div>
                {downloads.length > 0 && (
                    <Button
                        variant="outline"
                        onClick={handleClearAll}
                        className="text-sm sm:text-base"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear All
                    </Button>
                )}
            </motion.div>

            {downloads.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <Download className="h-16 w-16 text-muted-foreground mb-4" />
                            <h3 className="text-xl font-semibold mb-2">No downloads yet</h3>
                            <p className="text-muted-foreground text-center max-w-md">
                                Export your transactions from the Transactions page to see them here.
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-4"
                >
                    {downloads.map((download, index) => (
                        <motion.div
                            key={download.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className="hover:shadow-lg transition-shadow">
                                <CardContent className="p-4 sm:p-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className="mt-1">
                                                {getFileIcon(download.format)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-base sm:text-lg truncate">
                                                    {download.filename}
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-4 w-4" />
                                                        {format(new Date(download.downloadDate), "MMM d, yyyy 'at' h:mm a")}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{formatFileSize(download.fileSize)}</span>
                                                    <span>•</span>
                                                    <span>{download.transactionCount} transactions</span>
                                                    {download.period && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                                                                {download.period}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 sm:gap-3">
                                            <Button
                                                onClick={() => handleDownload(download)}
                                                className="flex-1 sm:flex-none"
                                                size="sm"
                                            >
                                                <Download className="h-4 w-4 mr-2" />
                                                Download
                                            </Button>
                                            <Button
                                                onClick={() => handleDelete(download.id)}
                                                variant="outline"
                                                size="sm"
                                                className="text-destructive hover:text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    );
}

