package com.chronicles.service;

import io.minio.BucketExistsArgs;
import io.minio.GetObjectArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class MinioFileStorageService implements FileStorageService {

    private final MinioClient minioClient;

    @Value("${minio.bucket-name}")
    private String bucketName;

    @Value("${minio.url}")
    private String minioUrl;

    @Override
    public String uploadFile(MultipartFile file) {
        try {
            ensureBucketExists();

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            } else {
                extension = ".png";
            }

            String generatedFileName = UUID.randomUUID() + extension;

            try (InputStream inputStream = file.getInputStream()) {
                minioClient.putObject(
                        PutObjectArgs.builder()
                                .bucket(bucketName)
                                .object(generatedFileName)
                                .stream(inputStream, file.getSize(), -1)
                                .contentType(file.getContentType() != null ? file.getContentType() : "application/octet-stream")
                                .build()
                );
            }

            return generatedFileName;
        } catch (Exception e) {
            log.error("Erro ao fazer upload do arquivo para o MinIO", e);
            throw new RuntimeException("Falha ao salvar arquivo no armazenamento", e);
        }
    }

    @Override
    public String getFileUrl(String fileName) {
        return String.format("%s/%s/%s", minioUrl, bucketName, fileName);
    }

    @Override
    public InputStream getFile(String fileName) {
        try {
            return minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket(bucketName)
                            .object(fileName)
                            .build()
            );
        } catch (Exception e) {
            log.error("Erro ao obter arquivo do MinIO: {}", fileName, e);
            throw new RuntimeException("Arquivo não encontrado no armazenamento", e);
        }
    }

    private void ensureBucketExists() {
        try {
            boolean exists = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
            if (!exists) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
                log.info("Bucket '{}' criado com sucesso no MinIO.", bucketName);
            }
        } catch (Exception e) {
            log.warn("Verificação/criação do bucket '{}' no MinIO falhou ou já existe: {}", bucketName, e.getMessage());
        }
    }
}
