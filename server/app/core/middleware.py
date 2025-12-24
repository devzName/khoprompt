import time
from fastapi import Request
from loguru import logger

async def log_requests(request: Request, call_next):
    # Sử dụng time.perf_counter() để đo thời gian chính xác hơn
    start_time = time.perf_counter()
    
    # Tiếp tục xử lý request
    response = await call_next(request)
    
    # Tính toán thời gian xử lý (ms)
    process_time = (time.perf_counter() - start_time) * 1000
    
    # Log kèm theo các thông tin hữu ích khác như Client IP
    logger.bind(
        method=request.method,
        path=request.url.path,
        status=response.status_code,
        duration=f"{process_time:.2f}ms"
    ).info(
        "Request processed: {method} {path} - Status: {status} - Time: {duration}",
        method=request.method,
        path=request.url.path,
        status=response.status_code,
        duration=f"{process_time:.2f}ms"
    )
    
    # Thêm Header vào response để tiện debug từ trình duyệt (Optional)
    response.headers["X-Process-Time"] = f"{process_time:.2f}ms"
    
    return response