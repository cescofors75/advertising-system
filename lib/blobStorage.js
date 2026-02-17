/**
 * Azure Blob Storage utility
 * Handles file uploads to Azure Blob Storage container 'publitaxi'
 */
import { BlobServiceClient } from '@azure/storage-blob';

let blobServiceClient = null;
let containerClient = null;

/**
 * Get or create the container client (singleton)
 */
function getContainerClient() {
  if (!containerClient) {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    const containerName = process.env.AZURE_STORAGE_CONTAINER || 'publitaxi';

    blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    containerClient = blobServiceClient.getContainerClient(containerName);
  }
  return containerClient;
}

/**
 * Upload a file buffer to Azure Blob Storage
 * @param {string} blobName - The name/path for the blob
 * @param {Buffer} buffer - File content as buffer
 * @param {string} contentType - MIME type of the file
 * @returns {Promise<string>} The public URL of the uploaded blob
 */
export async function uploadBlob(blobName, buffer, contentType) {
  const client = getContainerClient();
  const blockBlobClient = client.getBlockBlobClient(blobName);

  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: {
      blobContentType: contentType,
    },
  });

  // Return the public URL
  const baseUrl = process.env.NEXT_PUBLIC_AZURE_BLOB_URL || 
    `https://visittoo.blob.core.windows.net/publitaxi`;
  return `${baseUrl}/${blobName}`;
}

/**
 * Delete a blob from Azure Blob Storage
 * @param {string} blobName - The name/path of the blob to delete
 */
export async function deleteBlob(blobName) {
  const client = getContainerClient();
  const blockBlobClient = client.getBlockBlobClient(blobName);
  
  await blockBlobClient.deleteIfExists({
    deleteSnapshots: 'include',
  });
}

/**
 * Extract the blob name from a full Azure Blob URL
 * @param {string} url - Full URL like https://visittoo.blob.core.windows.net/publitaxi/1234_file.jpg
 * @returns {string} The blob name like '1234_file.jpg'
 */
export function getBlobNameFromUrl(url) {
  const baseUrl = process.env.NEXT_PUBLIC_AZURE_BLOB_URL || 
    'https://visittoo.blob.core.windows.net/publitaxi';
  return url.replace(`${baseUrl}/`, '');
}
