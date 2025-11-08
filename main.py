import time
import requests
import logging
import webbrowser
import platform
import os

# ===== CONFIG =====
SITES = [
    "http://portal.nysc.org.ng/nysc1/",
    "http://portal.nysc.org.ng/nysc2/",
    "http://portal.nysc.org.ng/nysc3/",
    "http://portal.nysc.org.ng/nysc4/",
]
EXPECTED_STATUS = 200
DELAY_BETWEEN_SITES = 60
OPEN_IN_BROWSER = True
PLAY_SOUND = True
# ==================

logging.basicConfig(level=logging.INFO, format="%(asctime)s  %(message)s")

def play_sound():
    """Play a simple sound alert depending on OS."""
    try:
        system = platform.system()
        if system == "Windows":
            import winsound
            winsound.MessageBeep()
        elif system == "Darwin":  # macOS
            os.system('say "A monitored website is up"')
        else:  # Linux
            os.system('paplay /usr/share/sounds/freedesktop/stereo/complete.oga 2>/dev/null || echo -e "\\a"')
    except Exception as e:
        logging.warning("Sound alert failed: %s", e)

def notify_up(url):
    msg = f"✅ {url} is UP!"
    print("\n" + "="*60)
    print(msg)
    print("="*60 + "\n")
    if PLAY_SOUND:
        play_sound()
    if OPEN_IN_BROWSER:
        try:
            webbrowser.open(url)
        except Exception as e:
            logging.warning("Browser open failed for %s: %s", url, e)

def check_site(url):
    """Return True if site responds with EXPECTED_STATUS."""
    try:
        r = requests.get(url, timeout=15)
        logging.info("[%s] -> HTTP %s", url, r.status_code)
        return r.status_code == EXPECTED_STATUS
    except requests.RequestException as e:
        logging.info("[%s] -> Error: %s", url, e)
        return False

def main():
    logging.info("Starting staggered site watcher with %s sites...", len(SITES))
    while True:
        for url in SITES:
            if check_site(url):
                notify_up(url)
            else:
                logging.info("Still down: %s", url)
            logging.info("Waiting %s seconds before next site...\n", DELAY_BETWEEN_SITES)
            time.sleep(DELAY_BETWEEN_SITES)
        # After one full cycle, total time ≈ DELAY_BETWEEN_SITES × len(SITES)
        # (Here, 4 sites × 60s = 4 min) + minor request time ≈ 5 minutes total

if __name__ == "__main__":
    main()
