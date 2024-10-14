'use client'

import { useState, useMemo, useEffect, useRef } from "react";
import { Menu, X, LayoutDashboard, Database, FilePlus, Edit, Search, Upload } from 'lucide-react'

import { DashboardNav } from '@/components/nav'
import { API_URL } from "@/constants";

const navItems = [
  { name: 'Search Data', href: '/', icon: <Search className="mr-2 h-4 w-4" /> },
  { name: 'Add Data', href: '/add', icon: <FilePlus className="mr-2 h-4 w-4" /> },
  { name: 'Edit/Delete Data', href: '/edit', icon: <Edit className="mr-2 h-4 w-4" /> },
  { name: 'View All Data', href: '/view', icon: <Database className="mr-2 h-4 w-4" /> },
  { name: 'Mass Upload', href: '/upload', icon: <Upload className="mr-2 h-4 w-4" /> },
]

function UploadData(){
  const [file, setFile] = useState<File | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isHovering, setIsHovering] = useState<boolean>(false);

  const handleFileChange = (uploadedFile: File | null) => {
    if (uploadedFile && uploadedFile.type === 'text/csv') {
      setFile(uploadedFile);
      setErrorMessage('');
      setStatusMessage('');
      setIsHovering(false);
    } else {
      setErrorMessage('Please upload a valid CSV file.');
      setStatusMessage('');
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const uploadedFile = e.dataTransfer.files[0];
    handleFileChange(uploadedFile);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsHovering(true);
  };

  const handleDragLeave = () => {
    setIsHovering(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMessage('Please select a CSV file.');
      setStatusMessage('');
      return;
    }

    setLoading(true);
    setStatusMessage('Uploading...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Replace with your API endpoint
      const response = await fetch(`${API_URL}/upload-csv`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setStatusMessage('File uploaded successfully!');
      } else {
        setErrorMessage('Error uploading file. Please try again.');
        setStatusMessage('');
      }
    } catch (error) {
      setErrorMessage('An unexpected error occurred.');
      setStatusMessage('');
    } finally {
      setLoading(false);
      setFile(null); // Reset file input
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Upload CSV</h1>
      <form onSubmit={handleSubmit}>
        <div
          className={`border-2 border-dashed rounded-lg p-6 mb-4 transition-all duration-300 ease-in-out ${
            isHovering
              ? 'border-blue-500 bg-blue-50'
              : file
              ? 'border-green-500'
              : 'border-gray-300'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <p className="text-center text-muted-foreground">
            {file ? (
              <span>File: <strong>{file.name}</strong></span>
            ) : isHovering ? (
              <span className="text-blue-500">Drop this file here</span>
            ) : (
              <span>Drag & drop your CSV file here or click to upload</span>
            )}
          </p>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
            className="hidden"
            id="csvFile"
          />
          <label
            htmlFor="csvFile"
            className="cursor-pointer text-blue-500 text-center block mt-4"
          >
            Choose File
          </label>
        </div>
        {errorMessage && (
          <div className="mb-4 text-red-500 text-center">{errorMessage}</div>
        )}
        {statusMessage && (
          <div className="mb-4 text-green-500 text-center">{statusMessage}</div>
        )}
        <div className="flex justify-center">
        <button
          type="submit"
          className={`bg-blue-500 text-white rounded px-4 py-2 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={loading}
        >
          {loading ? 'Uploading...' : 'Upload'}
        </button>
        </div>
      </form>
    </div>
  );
};


export default function() {
  return (
    <div className="min-h-screen ">
      {/* bg-gray-100 */}
      <DashboardNav navItems={navItems} />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <UploadData />
      </main>
    </div>
  )
}