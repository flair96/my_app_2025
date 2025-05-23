import os
import logging
from cassandra.cluster import Cluster
from cassandra.auth import PlainTextAuthProvider

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def handler(event, context):
    contact_points = os.environ.get('CASSANDRA_CONTACT_POINTS', '').split(',')
    username = os.environ.get('CASSANDRA_USERNAME')
    password = os.environ.get('CASSANDRA_PASSWORD')
    
    if not contact_points or not username or not password:
        logger.error("Missing required Cassandra connection environment variables.")
        return

    auth_provider = PlainTextAuthProvider(username=username, password=password)
    cluster = Cluster(contact_points=contact_points, auth_provider=auth_provider)
    session = cluster.connect('your_keyspace')

    try:
        logger.info("Connected to Cassandra. Running cleanup query.")
        # Example cleanup query: delete data older than 30 days
        session.execute("""
            DELETE FROM your_table
            WHERE your_timestamp_column < toTimestamp(now() - 2592000000)
        """)
        logger.info("Cleanup successful.")
    except Exception as e:
        logger.error(f"Cleanup failed: {e}")
    finally:
        cluster.shutdown()
