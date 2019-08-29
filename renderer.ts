const scale = 1;
let canvas, ctx, prevButton, nextButton; 
var pdfDoc = null,
    pageNum = 1,
    pageRendering = false,
    pageNumPending = null;


/**
 * Get page info from document, resize canvas accordingly, and render page.
 * @param num Page number.
 */
function renderPage(num: number) {
pageRendering = true;
// Using promise to fetch the page
pdfDoc.getPage(num).then(function(page) {
//   const canvas = document.getElementById('pdf') as HTMLCanvasElement;
//   const ctx = canvas.getContext('2d');
    var viewport = page.getViewport({ scale: scale, });
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    // Render PDF page into canvas context
    var renderContext = {
    canvasContext: ctx,
    viewport: viewport,
    };
    var renderTask = page.render(renderContext);
    // Wait for rendering to finish
    renderTask.promise.then(function () {
    pageRendering = false;
    if (pageNumPending !== null) {
        // New page rendering is pending
        renderPage(pageNumPending);
        pageNumPending = null;
    }
    });
});
// Update page counters
document.getElementById('page_num').textContent = num.toString();
}


const loadingTask = pdfjsLib.getDocument("https://pdftron.s3.amazonaws.com/downloads/pl/Chart_.Vector.pdf");
loadingTask.promise.then(function(pdf){
  pdfDoc = pdf;
  document.getElementById('page_count').textContent = pdf.numPages.toString();
  canvas = document.getElementById("pdf") as HTMLCanvasElement;
  ctx = canvas.getContext("2d");
  prevButton = document.getElementById('prev').addEventListener('click', onPrevPage);
  nextButton = document.getElementById('next').addEventListener('click', onNextPage);
  renderPage(pageNum);
});

/**
 * If another page rendering in progress, waits until the rendering is
 * finised. Otherwise, executes rendering immediately.
 */
function queueRenderPage(num) {
  if (pageRendering) {
    pageNumPending = num;
  } else {
    renderPage(num);
  }
}
/**
 * Displays previous page.
 */
function onPrevPage() {
  if (pageNum <= 1) {
    return;
  }
  pageNum--;
  queueRenderPage(pageNum);
}
/**
 * Displays next page.
 */
function onNextPage() {
  if (pageNum >= pdfDoc.numPages) {
    return;
  }
  pageNum++;
  queueRenderPage(pageNum);
}
