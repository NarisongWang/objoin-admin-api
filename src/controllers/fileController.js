const fs = require('fs')
const path = require("path")
const { BlobServiceClient } = require('@azure/storage-blob')

// @desc    upload pdf files to azure blob storage 
// @request N/A
// @route   N/A
// @acccess Private function
// @params  installationOrderNumber: order number, localFilePath:local file path, files: uploading pdf files array
const uploadPdfFilesToAzure = (installationOrderNumber, localFilePath, files) =>{
    return new Promise(async (resolve, reject) =>{
        try {
            const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONN)
            const containerName = process.env.AZURE_STORAGE_CONTAINER
            const containerClient = blobServiceClient.getContainerClient(containerName)
    
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const filePath = process.env.LOCAL_FILE_SERVER+localFilePath.substring(32)+file
                const blobName = filePath.substring(filePath.indexOf(installationOrderNumber),filePath.length)
                const blockBlobClient  = containerClient.getBlockBlobClient(blobName)
                const data = await fs.promises.readFile(filePath)
                await blockBlobClient.upload(data, data.length)
            }
            resolve()
        } catch (error) {
            reject(error)
        }
    })
}

// @desc    delete installation order directory from azure blob storage 
// @request N/A
// @route   N/A
// @acccess Private function
// @params  dir: directory name
const deleteInstallationOrderDirectoryFromAzure = (dir)=>{
    return new Promise(async(resolve, reject) =>{
        try {
            const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONN)
            const containerName = process.env.AZURE_STORAGE_CONTAINER
            const containerClient = blobServiceClient.getContainerClient(containerName)
            // Get a flat list of all blobs in the directory
            const blobs = []
            for await (const blob of containerClient.listBlobsFlat({ prefix: dir })) {
                blobs.push(blob.name)
            }
            // Delete all blobs in the directory
            for (const blobName of blobs) {
                await containerClient.deleteBlob(blobName);
            }
            resolve()
        } catch (error) {
            reject(error)
        }
    })
}

// @desc    find all pdf files in directory 
// @request N/A
// @route   N/A
// @acccess private function
// @params  dir: directory name
const findPdfFiles = (dir) =>{
    return new Promise(async(resolve, reject) =>{
        try {
            let files = []
            const filesInDirectory = await fs.readdirSync(dir)
            for (const file of filesInDirectory) {
                const absolute = path.join(dir, file)
                if (fs.statSync(absolute).isDirectory()) {
                    files = files.concat(await findPdfFiles(absolute))
                } else {
                    if(path.extname(file).toLowerCase()==='.pdf'){
                        files.push(absolute)
                    }
                }
            }
            resolve(files)
        } catch (error) {
            reject(error)
        }
    })
}

module.exports = {
    uploadPdfFilesToAzure,
    deleteInstallationOrderDirectoryFromAzure,
    findPdfFiles
}