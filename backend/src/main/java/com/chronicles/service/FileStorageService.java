package com.chronicles.service;

import org.springframework.web.multipart.MultipartFile;
import java.io.InputStream;

public interface FileStorageService {
    String uploadFile(MultipartFile file);
    String getFileUrl(String fileName);
    InputStream getFile(String fileName);
}
