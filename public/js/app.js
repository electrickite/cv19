if ('serviceWorker' in navigator) {
  navigator.serviceWorker
  .register('./sw.js')
  .then(function() {
    console.log('Service Worker registered');
  });
}


var colors = {
  labels: '#666',
  lines: 'rgba(0, 0, 0, 0.2)',
  data1Border: '#000',
  data1Background: 'rgba(0, 0, 0, 0.2)',
  data2Border: '#444',
  data2Background: 'rgba(0, 0, 0, 0.3)'
};
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  colors = {
    labels: '#aaa',
    lines: 'rgba(255, 255, 255, 0.2)',
    data1Border: '#fff',
    data1Background: 'rgba(255, 255, 255, 0.2)',
    data2Border: '#aaa',
    data2Background: 'rgba(255, 255, 255, 0.3)',
  };
}


fetch('stats.php')
.then(function(res) {
  return res.json();
}).then(function(data) {
  if (! Array.isArray(data)) { return; }

  var ctx = document.getElementById('chart').getContext('2d');
  var myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(function(day) {
        var date = new Date(day.date);
        return (date.getUTCMonth() + 1) + '/' + date.getUTCDate();
      }),
      datasets: [{
        label: 'Cases',
        borderColor: colors.data1Border,
        backgroundColor: colors.data1Background,
        data: data.map(function(day) {
          return day.cases;
        })
      },{
        label: 'Deaths',
        borderColor: colors.data2Border,
        backgroundColor: colors.data2Background,
        data: data.map(function(day) {
          return day.deaths;
        })
      }]
    },
    options: {
      legend: {
        labels: {
          fontColor: colors.labels
        }
      },
      scales: {
        yAxes: [{
          gridLines: {
            color: colors.lines
          },
          ticks: {
            fontColor: colors.labels,
            beginAtZero: true
          }
        }],
        xAxes: [{
          gridLines: {
            color: colors.lines
          },
          ticks: {
            fontColor: colors.labels
          }
        }]
      }
    }
  });
});
