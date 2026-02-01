'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { documentsApi, shipmentsApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui';
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Documents" backHref="/dashboard" backLabel="Dashboard" />

      <main className="p-8 max-w-6xl mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Documents</h2>
          <p className="text-gray-600">View and download your documents</p>
        </div>

        <Card className="p-6 mb-6">
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

        <Card className="p-0 overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 text-center text-gray-500">Loading...</div>
            ) : documents.length === 0 ? (
              <div className="p-12 text-center text-gray-500">No documents found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      File Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Shipment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Uploaded
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {doc.file_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          href={`/shipments/${doc.shipment_id}`}
                          className="text-primary-600 hover:text-primary-700"
                        >
                          View shipment
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {doc.file_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatFileSize(doc.file_size)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTimeUTC(doc.uploaded_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Download
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
