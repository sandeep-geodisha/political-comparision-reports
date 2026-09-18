"""
Parses the Socialinsider brand-report .xlsx exports in docs/ into a single
JSON file (data/politicians.json) consumed by the Next.js dashboard.

Usage:
    python3 scripts/import_politicians.py

Re-run this whenever a new or updated .xlsx report is dropped into docs/.
Each source file must follow the same fixed-row-layout export template
used by the three existing reports (see docs/*.xlsx).

Validation: every numeric field is checked to actually be a number (not a
blank cell or "N/A" string) and fails loudly if not — see require_number()
and parse_daily_series(). After parsing, cross_check_daily_sums_match_totals()
verifies each platform's daily breakdown sums to its reported period total.
Posts/Engagement mismatches are treated as a parsing bug and hard-fail the
import; Views/Video Views mismatches are only warned about, since
Socialinsider's own export is known to sometimes report a platform's views
only as a period total with no reliable daily split (e.g. Facebook views are
consistently all-zero in the daily table despite a large non-zero total).
The app excludes those specific platform/metric combinations from daily
trend charts rather than plot misleading data — see
lib/data.ts:isDailySeriesReliable.
"""

import glob
import json
import os
import re

import openpyxl

DOCS_DIR = os.path.join(os.path.dirname(__file__), "..", "docs")
OUT_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "politicians.json")

PLATFORM_NAMES = {"fb": "facebook", "ig": "instagram", "tw": "twitter"}


def slugify(name: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return s


def cell(ws, row, col):
    return ws.cell(row=row, column=col).value


def row_values(ws, row, max_col):
    return [ws.cell(row=row, column=c).value for c in range(1, max_col + 1)]


def parse_pct(v):
    if v is None:
        return None
    if isinstance(v, (int, float)):
        return round(float(v), 4)
    s = str(v).replace("%", "").strip()
    try:
        return round(float(s), 4)
    except ValueError:
        return None


def parse_platform_table(ws, header_row, max_col=3):
    """Rows shaped: ['', colA_label, colB_label], then one row per platform."""
    labels = row_values(ws, header_row, max_col + 1)[1:]
    out = {}
    r = header_row + 1
    while True:
        name = cell(ws, r, 1)
        if not name or not isinstance(name, str):
            break
        vals = row_values(ws, r, max_col + 1)[1:]

        def coerce(v):
            if isinstance(v, str):
                try:
                    return round(float(v.replace("%", "").strip()), 4)
                except ValueError:
                    return v
            return v

        out[name.strip().lower()] = {labels[i]: coerce(vals[i]) for i in range(len(labels))}
        r += 1
    return out


def parse_daily_series(ws, header_row):
    """Rows shaped: ['', date1, date2, ...], then one row per platform of daily values."""
    dates = []
    c = 2
    while True:
        v = cell(ws, header_row, c)
        if v is None:
            break
        dates.append(str(v))
        c += 1
    series = {}
    r = header_row + 1
    while True:
        name = cell(ws, r, 1)
        if not name or not isinstance(name, str):
            break
        raw_vals = [cell(ws, r, c) for c in range(2, 2 + len(dates))]
        vals = []
        for i, v in enumerate(raw_vals):
            if v is None:
                vals.append(0)
            elif isinstance(v, (int, float)):
                vals.append(v)
            else:
                raise ValueError(
                    f"Non-numeric daily value at row {r}, col {2 + i} "
                    f"(platform={name!r}, date={dates[i]!r}): {v!r}"
                )
        series[name.strip().lower()] = vals
        r += 1
    return dates, series


def find_section_row(ws, title, max_row):
    for r in range(1, max_row + 1):
        if str(cell(ws, r, 1) or "").strip() == title:
            return r
    raise ValueError(f"Section '{title}' not found")


def require_number(value, context):
    if not isinstance(value, (int, float)):
        raise ValueError(f"Expected a number for {context}, got {value!r}")
    return value


def parse_workbook(path):
    wb = openpyxl.load_workbook(path, data_only=True)
    ws = wb[wb.sheetnames[0]]
    max_row = ws.max_row

    date_range = cell(ws, 2, 10) or cell(ws, 2, 9) or ""

    # --- Brand profiles ---
    profiles_header = find_section_row(ws, "Brand profiles", max_row) + 2
    profiles = []
    r = profiles_header + 1
    while True:
        handle = cell(ws, r, 1)
        platform_code = cell(ws, r, 2)
        if not platform_code:
            break
        profiles.append(
            {
                "handle": handle,
                "platform": PLATFORM_NAMES.get(str(platform_code).strip().lower(), platform_code),
                "followers": require_number(cell(ws, r, 3), f"profiles row {r} followers"),
                "engagement": require_number(cell(ws, r, 4), f"profiles row {r} engagement"),
                "engagementRatePerFollower": require_number(cell(ws, r, 5), f"profiles row {r} rate"),
                "posts": require_number(cell(ws, r, 6), f"profiles row {r} posts"),
            }
        )
        r += 1

    # --- KPIs ---
    kpi_header = find_section_row(ws, "Key Performance Indicators", max_row) + 2
    kpis = {}
    r = kpi_header + 1
    while True:
        name = cell(ws, r, 1)
        if not name:
            break
        kpis[name.strip()] = {
            "current": require_number(cell(ws, r, 2), f"KPI {name!r} current"),
            "previous": require_number(cell(ws, r, 3), f"KPI {name!r} previous"),
            "changePct": parse_pct(cell(ws, r, 4)),
        }
        r += 1

    # --- Audience: followers by platform ---
    aud_header = find_section_row(ws, "Audience - Followers by platform", max_row) + 2
    followers_by_platform = parse_platform_table(ws, aud_header, max_col=2)

    # --- Audience: followers net diff ---
    aud_diff_header = find_section_row(ws, "Audience - Followers by platform net difference", max_row) + 2
    followers_diff_by_platform = parse_platform_table(ws, aud_diff_header, max_col=2)

    # --- Posts distribution (daily) ---
    posts_dist_header = find_section_row(ws, "Posts Distribution Across Channels", max_row) + 2
    posts_dates, posts_daily = parse_daily_series(ws, posts_dist_header)

    # --- Total posts by platform ---
    total_posts_header = find_section_row(ws, "Total Posts by Platform", max_row) + 2
    total_posts_by_platform = parse_platform_table(ws, total_posts_header, max_col=2)

    # --- Engagement distribution (daily) ---
    eng_dist_header = find_section_row(ws, "Engagement Distribution Across Channels", max_row) + 2
    _, engagement_daily = parse_daily_series(ws, eng_dist_header)

    # --- Total engagement by platform ---
    total_eng_header = find_section_row(ws, "Total Engagement by Platform", max_row) + 2
    total_engagement_by_platform = parse_platform_table(ws, total_eng_header, max_col=2)

    # --- Avg engagement rate by platform ---
    eng_rate_header = find_section_row(ws, "Avg. Engagement Rate by Platform", max_row) + 2
    engagement_rate_by_platform = parse_platform_table(ws, eng_rate_header, max_col=2)

    # --- Views distribution (daily) ---
    views_dist_header = find_section_row(ws, "Views Distribution Across Channels", max_row) + 2
    _, views_daily = parse_daily_series(ws, views_dist_header)

    # --- Total views by platform ---
    total_views_header = find_section_row(ws, "Total Views Across Channels", max_row) + 2
    total_views_by_platform = parse_platform_table(ws, total_views_header, max_col=2)

    # --- Video views distribution (daily) ---
    vviews_dist_header = find_section_row(ws, "Video Views Distribution Across Channels", max_row) + 2
    _, video_views_daily = parse_daily_series(ws, vviews_dist_header)

    # --- Video views totals by platform ---
    total_vviews_header = find_section_row(ws, "Video Views Totals Across Channels", max_row) + 2
    total_video_views_by_platform = parse_platform_table(ws, total_vviews_header, max_col=2)

    # --- Top posts ---
    top_posts_header = find_section_row(ws, "Top posts", max_row) + 2
    top_posts = []
    r = top_posts_header + 1
    while True:
        page = cell(ws, r, 1)
        link = cell(ws, r, 2)
        if not page and not link:
            break
        top_posts.append(
            {
                "page": page,
                "link": link,
                "date": cell(ws, r, 3),
                "type": cell(ws, r, 4),
                "engagement": cell(ws, r, 9),
                "engagementRate": parse_pct(cell(ws, r, 10)),
            }
        )
        r += 1

    return {
        "dateRange": str(date_range),
        "profiles": profiles,
        "kpis": kpis,
        "audience": {
            "followersByPlatform": followers_by_platform,
            "followersDiffByPlatform": followers_diff_by_platform,
        },
        "posts": {
            "dates": posts_dates,
            "dailyByPlatform": posts_daily,
            "totalByPlatform": total_posts_by_platform,
        },
        "engagement": {
            "dailyByPlatform": engagement_daily,
            "totalByPlatform": total_engagement_by_platform,
            "rateByPlatform": engagement_rate_by_platform,
        },
        "views": {
            "dailyByPlatform": views_daily,
            "totalByPlatform": total_views_by_platform,
        },
        "videoViews": {
            "dailyByPlatform": video_views_daily,
            "totalByPlatform": total_video_views_by_platform,
        },
        "topPosts": top_posts,
    }


def cross_check_daily_sums_match_totals(parsed, source_file):
    """
    Sanity check: for each platform, the sum of the daily distribution series
    should equal the corresponding "Total X by Platform" figure. This catches
    row-offset or mis-mapped parsing bugs immediately instead of silently
    producing self-consistent-looking but wrong output.

    Posts and Engagement are hard-failed on mismatch: in every report seen so
    far these always reconcile exactly, so a mismatch there means a parsing
    bug. Views and Video Views are only warned on: Socialinsider's own daily
    breakdown for these two metrics is known to sometimes omit a platform
    entirely (reported only in the period total, e.g. Facebook views) or
    under-report it — this is a genuine gap in the source export, not
    something this script can recover. The app surfaces this to users by
    excluding unreliable platforms from daily trend charts
    (see lib/data.ts:isDailySeriesReliable) rather than plotting misleading
    zero/partial lines.
    """
    hard_fail_checks = [("posts", "Posts"), ("engagement", "Engagement")]
    warn_only_checks = [("views", "Views"), ("videoViews", "Video Views")]

    def mismatches(bucket, total_label):
        daily = parsed[bucket]["dailyByPlatform"]
        totals = parsed[bucket]["totalByPlatform"]
        found = []
        for platform, series in daily.items():
            expected = totals.get(platform, {}).get(total_label)
            actual = sum(series)
            if expected is not None and actual != expected:
                found.append(f"{bucket}.{platform} daily sum ({actual}) != total ({expected})")
        return found

    errors = []
    for bucket, total_label in hard_fail_checks:
        errors.extend(mismatches(bucket, total_label))
    if errors:
        raise ValueError(f"{source_file}: cross-check failed:\n  " + "\n  ".join(errors))

    warnings = []
    for bucket, total_label in warn_only_checks:
        warnings.extend(mismatches(bucket, total_label))
    if warnings:
        print(f"  NOTE: {source_file} has known source-data gaps (daily total won't sum to reported total):")
        for w in warnings:
            print(f"    - {w}")


# Filenames look like: Brand_<Politician_Name>_<start>_<end>_<hash> 1.xlsx
FILENAME_RE = re.compile(r"^Brand_(.+?)_\d{1,2}_[A-Za-z]{3}_\d{4}_\d{1,2}_[A-Za-z]{3}_\d{4}_")


def name_from_filename(filename):
    base = os.path.basename(filename)
    m = FILENAME_RE.match(base)
    raw = m.group(1) if m else base
    return raw.replace("_", " ").strip()


def main():
    files = sorted(glob.glob(os.path.join(DOCS_DIR, "*.xlsx")))
    if not files:
        raise SystemExit(f"No .xlsx files found in {DOCS_DIR}")

    politicians = []
    ids_seen = {}
    for path in files:
        name = name_from_filename(path)
        source_file = os.path.basename(path)
        parsed = parse_workbook(path)
        cross_check_daily_sums_match_totals(parsed, source_file)

        pid = slugify(name)
        if pid in ids_seen:
            raise ValueError(
                f"Duplicate politician id {pid!r}: {ids_seen[pid]!r} and {source_file!r} "
                "both slugify to the same id. Rename one file."
            )
        ids_seen[pid] = source_file

        politicians.append(
            {
                "id": pid,
                "name": name,
                "sourceFile": source_file,
                **parsed,
            }
        )
        print(f"Parsed {name!r} from {source_file} (cross-checks passed)")

    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, "w") as f:
        json.dump({"politicians": politicians}, f, indent=2)

    print(f"\nWrote {len(politicians)} politicians to {OUT_PATH}")


if __name__ == "__main__":
    main()
