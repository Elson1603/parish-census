"""Renders ReportChart definitions to PNG bytes via matplotlib, for embedding
in the server-generated PDF (the on-screen report view uses Recharts instead;
this is purely for the PDF export path)."""

import io

import matplotlib

matplotlib.use("Agg")  # headless, no display server needed

import matplotlib.pyplot as plt

from app.services.report_data import ReportChart

_COLORS = ["#2563eb", "#16a34a", "#d97706", "#9333ea", "#dc2626", "#0891b2", "#65a30d", "#c026d3"]


def render_chart_png(chart: ReportChart) -> bytes:
    fig, ax = plt.subplots(figsize=(6, 3.5), dpi=150)

    if chart.kind == "pie" and sum(chart.values) > 0:
        ax.pie(
            chart.values,
            labels=chart.labels,
            autopct="%1.0f%%",
            colors=_COLORS[: len(chart.labels)],
            textprops={"fontsize": 8},
        )
        ax.axis("equal")
    else:
        ax.bar(chart.labels, chart.values, color=_COLORS[0])
        ax.set_ylabel("Members")
        ax.tick_params(axis="x", labelrotation=30, labelsize=7)
        for label in ax.get_xticklabels():
            label.set_ha("right")
        ax.spines["top"].set_visible(False)
        ax.spines["right"].set_visible(False)

    ax.set_title(chart.title, fontsize=11, fontweight="bold")
    fig.tight_layout()

    buffer = io.BytesIO()
    fig.savefig(buffer, format="png")
    plt.close(fig)
    buffer.seek(0)
    return buffer.read()
