import requests
import time
from datetime import datetime
from models import db, MonitoredSite

CHECK_INTERVAL = 60  # seconds between site checks (staggered)

def check_sites_background(app):
    """
    Continuously monitor all sites in the DB.
    """
    with app.app_context():
        while True:
            sites = MonitoredSite.query.all()
            for site in sites:
                try:
                    r = requests.get(site.url, timeout=15)
                    status = 'up' if r.status_code == 200 else 'down'
                except requests.RequestException:
                    status = 'down'

                if status != site.last_status:
                    # Status changed -> notify (optional)
                    site.last_status = status
                    print(f"{site.url} changed status to {status}")

                site.last_checked = datetime.utcnow()
                db.session.commit()

                time.sleep(5)  # staggered between sites
            # Sleep a bit before full loop
            time.sleep(CHECK_INTERVAL - len(sites)*5)
