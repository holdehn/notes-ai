import { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';
const PDFViewer = ({ url }: { url: string }) => {
  const [numPages, setNumPages] = useState<number>(0);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    console.log(`Loaded PDF with ${numPages} pages.`);
  }
  return (
    <div className="relative select-none">
      <Document file={url} onLoadSuccess={onDocumentLoadSuccess}>
        {Array.from(new Array(numPages), (el, index) => (
          <Page
            key={`page_${index + 1}`}
            pageNumber={index + 1}
            scale={1.35}
            renderTextLayer={true}
          />
        ))}
      </Document>
    </div>
  );
};

export default PDFViewer;
