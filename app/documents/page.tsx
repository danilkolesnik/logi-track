'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { documentsApi, shipmentsApi } from '@/lib/api';
import { Card, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui';
import { formatFileSize } from '@/lib/helpers';
import { formatDateTimeUTC } from '@/lib/utils/date';
import Header from '@/components/Header';
import type { Document } from '@/types/api';
import type { Shipment } from '@/types/api';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadShipmentId, setUploadShipmentId] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filterShipmentId, setFilterShipmentId] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getDocuments = async () => {
    setLoading(true);
    try {
      const res = await documentsApi.getList();
      setDocuments(res.data ?? []);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load documents');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const submitUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadShipmentId.trim() || !uploadFile) {
      toast.error('Choose a shipment and a file');
      return;
    }
    setUploading(true);
    try {
      const res = await documentsApi.upload(uploadShipmentId, uploadFile);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success('Document uploaded successfully');
      setUploadShipmentId('');
      setUploadFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      getDocuments();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (id: string, fileName: string) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return;
    }
    setDeletingId(id);
    try {
      const res = await documentsApi.delete(id);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success('Document deleted successfully');
      getDocuments();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete document');
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    getDocuments();
  }, []);

  useEffect(() => {
    let cancelled = false;
    shipmentsApi
      .getList()
      .then((res) => {
        if (!cancelled) setShipments(res.data ?? []);
      })
      .catch(() => {
        if (!cancelled) {
          toast.error('Failed to load shipments');
          setShipments([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Documents"/>

      <main className="p-8 max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Documents</h2>
            <p className="text-gray-600">View and download your documents</p>
          </div>
          <div className="flex flex-col gap-1 min-w-[250px]">
            <label htmlFor="filter-shipment" className="text-xs font-medium text-gray-600">
              Filter by Shipment
            </label>
            <select
              id="filter-shipment"
              value={filterShipmentId}
              onChange={(e) => setFilterShipmentId(e.target.value)}
              className="rounded border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">All shipments</option>
              {shipments.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.tracking_number} — {s.origin} → {s.destination}
                </option>
              ))}
            </select>
          </div>
        </div>
        <Card className="p-0 overflow-hidden mb-6">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 text-center text-gray-500">Loading...</div>
            ) : (() => {
              const filteredDocuments = filterShipmentId
                ? documents.filter((doc) => doc.shipment_id === filterShipmentId)
                : documents;
              return filteredDocuments.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  {filterShipmentId ? 'No documents found for selected shipment' : 'No documents found'}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>File Name</TableHead>
                        <TableHead>Shipment</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Uploaded</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDocuments.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell className="text-sm font-medium text-gray-900">
                            {doc.file_name}
                          </TableCell>
                          <TableCell className="text-sm">
                            <Link
                              href={`/shipments/${doc.shipment_id}`}
                              className="text-primary-600 hover:text-primary-700"
                            >
                              View shipment
                            </Link>
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {doc.file_type}
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {formatFileSize(doc.file_size)}
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {formatDateTimeUTC(doc.uploaded_at)}
                          </TableCell>
                          <TableCell className="text-right text-sm">
                            <div className="flex items-center justify-end gap-3">
                              <a
                                href={doc.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-600 hover:text-primary-700 font-medium"
                              >
                                Download
                              </a>
                              <button
                                type="button"
                                onClick={() => deleteDocument(doc.id, doc.file_name)}
                                disabled={deletingId === doc.id}
                                className="text-red-600 hover:text-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {deletingId === doc.id ? 'Deleting…' : 'Delete'}
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              );
            })()}
          </CardContent>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Upload document</h3>
          <form onSubmit={submitUpload} className="flex flex-wrap gap-4 items-end">
            <div className="flex flex-col gap-1 min-w-[200px]">
              <label htmlFor="upload-shipment" className="text-xs font-medium text-gray-600">
                Shipment
              </label>
              <select
                id="upload-shipment"
                value={uploadShipmentId}
                onChange={(e) => setUploadShipmentId(e.target.value)}
                required
                className="rounded border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">Select shipment</option>
                {shipments.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.tracking_number} — {s.origin} → {s.destination}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1 min-w-[200px]">
              <label htmlFor="upload-file-input" className="text-xs font-medium text-gray-600">
                File
              </label>
              <input
                ref={fileInputRef}
                id="upload-file-input"
                type="file"
                onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                required
                className="rounded border border-gray-300 px-3 py-2 text-sm block w-full"
              />
            </div>
            <button
              type="submit"
              disabled={uploading}
              className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded hover:bg-primary-700 disabled:opacity-50"
            >
              {uploading ? 'Uploading…' : 'Upload'}
            </button>
          </form>
        </Card>
      </main>
    </div>
  );
}
