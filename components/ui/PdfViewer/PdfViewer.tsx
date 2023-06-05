import { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';
const PDFViewer = ({
  url,
  onMouseUp,
  canDrawBox,
}: {
  url: string;
  onMouseUp: (
    start: { x: number; y: number },
    end: { x: number; y: number },
  ) => void;
  canDrawBox: boolean;
}) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [endPoint, setEndPoint] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (canDrawBox) {
      containerRef.current.style.cursor = 'crosshair';
    } else {
      containerRef.current.style.cursor = 'default';
    }
  }, [canDrawBox]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    console.log(`Loaded PDF with ${numPages} pages.`);
  }

  function onMouseDown(e: React.MouseEvent) {
    const boundingRect = (e.target as Element).getBoundingClientRect();
    // if (!canDrawBox) {
    //   return;
    // }
    setStartPoint({
      x: e.pageX - boundingRect.left,
      y: e.pageY - boundingRect.top,
    });
    setDragging(true);
  }

  function onMouseMove(e: React.MouseEvent) {
    // if (!canDrawBox) {
    //   return;
    // }
    if (dragging && startPoint) {
      const boundingRect = (e.target as Element).getBoundingClientRect();

      setEndPoint({
        x: e.pageX - boundingRect.left,
        y: e.pageY - boundingRect.top,
      });
    }
  }

  function onRelease(e: React.MouseEvent) {
    // if (!canDrawBox) {
    //   return;
    // }
    setDragging(false);
    if (startPoint && endPoint) {
      onMouseUp(startPoint, endPoint);
    }
  }
  return (
    <div
      ref={containerRef}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onRelease}
      className="relative select-none"
    >
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
      {startPoint && endPoint && dragging && (
        <div
          className="absolute border border-black"
          style={{
            top: Math.min(startPoint.y, endPoint.y),
            left: Math.min(startPoint.x, endPoint.x),
            width: Math.abs(endPoint.x - startPoint.x),
            height: Math.abs(endPoint.y - startPoint.y),
          }}
        />
      )}
    </div>
  );
};

export default PDFViewer;
