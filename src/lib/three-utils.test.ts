// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fileToDataURL } from './three-utils';

describe('fileToDataURL', () => {
  let mockFileReaderRef: { 
    readAsDataURL: ReturnType<typeof vi.fn>;
    result: string | ArrayBuffer | null;
    onload: ((event: ProgressEvent<FileReader>) => void) | null;
    onerror: ((event: ProgressEvent<FileReader>) => void) | null;
  };

  beforeEach(() => {
    mockFileReaderRef = {
      readAsDataURL: vi.fn(),
      result: null,
      onload: null,
      onerror: null,
    };
    
    vi.stubGlobal('FileReader', vi.fn(() => mockFileReaderRef));
  });

  afterEach(() => {
    vi.unstubAllGlobals(); 
    vi.resetAllMocks();   
  });

  it('should resolve with a data URL on successful file read', async () => {
    const mockFile = new File(['test content'], 'test.png', { type: 'image/png' });
    const mockDataURL = 'data:image/png;base64,dGVzdCBjb250ZW50';

    const promise = fileToDataURL(mockFile); 
    
    mockFileReaderRef.result = mockDataURL; 
    if (mockFileReaderRef.onload) {
      mockFileReaderRef.onload({} as ProgressEvent<FileReader>); 
    } else {
      throw new Error("onload handler was not set by fileToDataURL");
    }
        
    await expect(promise).resolves.toBe(mockDataURL);
    expect(mockFileReaderRef.readAsDataURL).toHaveBeenCalledWith(mockFile);
  });

  it('should reject with an error if file reading fails', async () => {
    const mockFile = new File(['test content error'], 'error.png', { type: 'image/png' });
    
    const promise = fileToDataURL(mockFile);

    if (mockFileReaderRef.onerror) {
      mockFileReaderRef.onerror({} as ProgressEvent<FileReader>); 
    } else {
      throw new Error("onerror handler was not set by fileToDataURL");
    }
    
    await expect(promise).rejects.toThrowError('Error reading file');
    expect(mockFileReaderRef.readAsDataURL).toHaveBeenCalledWith(mockFile);
  });

  it('should reject with an error if onload is called with null result', async () => {
    const mockFile = new File(['null result test'], 'null.png', { type: 'image/png' });
    
    const promise = fileToDataURL(mockFile);

    mockFileReaderRef.result = null; 
    if (mockFileReaderRef.onload) {
      mockFileReaderRef.onload({} as ProgressEvent<FileReader>);
    } else {
      throw new Error("onload handler was not set by fileToDataURL");
    }

    await expect(promise).rejects.toThrowError('File reading resulted in null or ArrayBuffer.');
    expect(mockFileReaderRef.readAsDataURL).toHaveBeenCalledWith(mockFile);
  });
  
  it('should reject with an error if onload is called with ArrayBuffer result', async () => {
    const mockFile = new File(['arraybuffer test'], 'array.png', { type: 'image/png' });
    const arrayBuffer = new ArrayBuffer(8);

    const promise = fileToDataURL(mockFile);
    
    mockFileReaderRef.result = arrayBuffer; 
    if (mockFileReaderRef.onload) {
      mockFileReaderRef.onload({} as ProgressEvent<FileReader>);
    } else {
      throw new Error("onload handler was not set by fileToDataURL");
    }
    
    await expect(promise).rejects.toThrowError('File reading resulted in null or ArrayBuffer.');
    expect(mockFileReaderRef.readAsDataURL).toHaveBeenCalledWith(mockFile);
  });
});
