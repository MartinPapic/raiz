from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from app.services.ingestion import parse_rss_feed
from app.database import Session, engine
from app.models import Source
from sqlmodel import select
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

scheduler = BackgroundScheduler()

def run_ingestion_job():
    logger.info("Starting scheduled ingestion job...")
    with Session(engine) as session:
        sources = session.exec(select(Source)).all()
        for source in sources:
            try:
                logger.info(f"Ingesting from {source.name}...")
                count = parse_rss_feed(source.url, source.name)
                logger.info(f"Ingested {count} articles from {source.name}")
            except Exception as e:
                logger.error(f"Error ingesting from {source.name}: {e}")
    logger.info("Scheduled ingestion job completed.")

def start_scheduler():
    if not scheduler.running:
        # Run every 1 hour
        trigger = IntervalTrigger(hours=1)
        scheduler.add_job(
            run_ingestion_job,
            trigger=trigger,
            id='ingestion_job',
            replace_existing=True,
            next_run_time=None # Don't run immediately on start, wait for interval
        )
        scheduler.start()
        logger.info("Scheduler started.")

def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown()
        logger.info("Scheduler stopped.")

def get_scheduler_status():
    job = scheduler.get_job('ingestion_job')
    return {
        "running": scheduler.running,
        "next_run_time": job.next_run_time.isoformat() if job and job.next_run_time else None
    }
