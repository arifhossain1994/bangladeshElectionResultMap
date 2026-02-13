function renderParliament(resultData) {
  Highcharts.chart("container", {
    chart: {
      type: "item",
      backgroundColor: "transparent",
    },
    title: {
      text: null,
    },
    subtitle: {
      text: "300 Seats",
      style: {
        color: "#999999",
        fontSize: "24px",
        fontWeight: "bold",
      },
    },
    legend: {
      enabled: true,
      layout: "horizontal",
      align: "bottom",
      verticalAlign: "bottom",
      symbolRadius: 4,
      labelFormat:
        '<span style="color:{color}"></span> {name} <span style="opacity: 0.6; margin-left: 4px;">{y}</span>',
      itemStyle: {
        fontSize: "12px",
        fontWeight: "normal",
      },
    },
    series: [
      {
        name: "Seats",
        data: resultData,
        dataLabels: {
          enabled: false,
        },
        center: ["50%", "50%"],
        size: "120%",
        startAngle: -100,
        endAngle: 100,
        pointSize: 80,
      },
    ],
  });
}

// Mock data
const mockJsonFromApi = [
  ["BNP", 224, "#006a4e", "BNP"],
  ["Independents", 62, "#FFD700", "IND"],
  ["Jatiya Party", 11, "#da251d", "JP"],
  ["Others", 3, "#808080", "OTH"],
];

// Function to get parliament data from the page's electionResults
function getParliamentData() {
  try {
    // Check if electionResults and teamNameCONST are available
    if (
      typeof electionResults !== "undefined" &&
      typeof teamNameCONST !== "undefined"
    ) {
      const teamSeats = {};

      // Count seats by team
      for (const seatKey in electionResults) {
        const result = electionResults[seatKey];
        const team = result.winnerTeam;

        if (!teamSeats[team]) {
          teamSeats[team] = 0;
        }
        teamSeats[team]++;
      }

      const seatData = [];

      // Sort teams by seat count (largest first) for better grouping
      const sortedTeams = Object.entries(teamSeats).sort((a, b) => b[1] - a[1]);

      // Add seats grouped by team
      const isMobile =
        typeof window !== "undefined" && window.innerWidth <= 768;
      for (const [team, count] of sortedTeams) {
        if (team && teamNameCONST[team]) {
          const teamConfig = teamNameCONST[team];
          const colorKey = teamConfig.color;
          const color =
            typeof colorMapCONST !== "undefined"
              ? colorMapCONST[colorKey]
              : "#cccccc";

          // Use short name on mobile if helper exists
          let displayName = teamConfig.fullName;
          if (isMobile && typeof getTeamShortName === "function") {
            try {
              displayName = getTeamShortName(team);
            } catch (e) {
              displayName = teamConfig.fullName;
            }
          }

          // Add combined total for this team
          seatData.push({
            name: displayName,
            y: count,
            color: color,
          });
        }
      }

      // Fill remaining seats to reach 300
      const allocatedCount = seatData.reduce((sum, item) => sum + item.y, 0);
      const remainingSeats = 300 - allocatedCount;
      if (remainingSeats > 0) {
        seatData.push({
          name: "Unallocated",
          y: remainingSeats,
          color: "#e8e8e8",
          showInLegend: false,
        });
      }

      console.log("Parliament data loaded:", seatData.length, "seats");
      console.log("Team breakdown:", sortedTeams);
      return seatData;
    }
  } catch (error) {
    console.log("Could not load data from page:", error);
  }

  // Fallback mock data - all unallocated
  const mockData = [];
  for (let i = 0; i < 300; i++) {
    mockData.push({
      name: "Unallocated",
      y: 1,
      color: "#e8e8e8",
    });
  }
  return mockData;
}

// Initialize the chart
function initChart() {
  if (typeof Highcharts !== "undefined") {
    const data = getParliamentData();
    renderParliament(data);
  } else {
    console.log("Waiting for Highcharts to load...");
    setTimeout(initChart, 100);
  }
}

// Wait for DOM to be ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initChart);
} else {
  initChart();
}
