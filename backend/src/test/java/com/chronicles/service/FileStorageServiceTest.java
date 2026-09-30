package com.chronicles.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;

import java.io.InputStream;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class FileStorageServiceTest {

    @Autowired
    private FileStorageService fileStorageService;

    @Test
    @DisplayName("uploadFile, getFileUrl and getFile should work seamlessly with MinIO")
    void uploadAndRetrieveFile() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test-image.png",
                "image/png",
                "sample-image-bytes".getBytes()
        );

        String fileName = fileStorageService.uploadFile(file);
        assertThat(fileName).endsWith(".png");
        assertThat(fileName.length()).isGreaterThan(36);

        String fileUrl = fileStorageService.getFileUrl(fileName);
        assertThat(fileUrl).contains("/chronicles/" + fileName);

        try (InputStream is = fileStorageService.getFile(fileName)) {
            assertThat(is).isNotNull();
            byte[] bytes = is.readAllBytes();
            assertThat(new String(bytes)).isEqualTo("sample-image-bytes");
        }
    }

    @Test
    @DisplayName("getFileUrl should format url with bucket name and file name")
    void getFileUrl_returnsProperUrl() {
        String url = fileStorageService.getFileUrl("sample.webp");
        assertThat(url).endsWith("/chronicles/sample.webp");
    }
}
