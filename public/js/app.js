if ('serviceWorker' in navigator) {
  navigator.serviceWorker
  .register('./sw.js')
  .then(function() {
    console.log('Service Worker registered');
  });
}

var data;
var chart;
var dataType = localStorage.getItem('dataType') || 'total';

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


function createChart() {
  var ctx = document.getElementById('chart').getContext('2d');
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: [{
        label: 'Cases',
        borderColor: colors.data1Border,
        backgroundColor: colors.data1Background,
        data: data[dataType].cases
      },{
        label: 'Deaths',
        borderColor: colors.data2Border,
        backgroundColor: colors.data2Background,
        data: data[dataType].deaths
      }]
    },
    options: {
      legend: {
        labels: {
          fontColor: colors.labels
        }
      },
      tooltips: {
        mode: 'x'
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
}

function updateDataType(type) {
  dataType = type;
  localStorage.setItem('dataType', type);

  if (!chart) { return; }
  chart.data.datasets[0].data = data[dataType].cases;
  chart.data.datasets[1].data = data[dataType].deaths;
  chart.update();
}

function calculateNew(type, day, index, array) {
  if (index == 0) {
    return day[type];
  } else {
    return Math.max(day[type] - array[index - 1][type], 0);
  }
}

function prepareData(data) {
  return {
    labels: data.map(function(day) {
      var date = new Date(day.date);
      return (date.getUTCMonth() + 1) + '/' + date.getUTCDate();
    }),
    total: {
      cases: data.map(function(day) {
        return day.cases;
      }),
      deaths: data.map(function(day) {
        return day.deaths;
      })
    },
    new: {
      cases: data.map(function(day, index) {
        return calculateNew('cases', day, index, data);
      }),
      deaths: data.map(function(day, index) {
        return calculateNew('deaths', day, index, data);
      })
    }
  };
}


document.querySelectorAll('input[name="dataToggle"]').forEach(function(input) {
  if (input.value == dataType) {
    input.checked = true;
  }
  input.addEventListener('change', function() {
    updateDataType(this.value);
  });
});


fetch('stats.php')
.then(function(res) {
  return res.json();
}).then(function(fetchedData) {
  if (! Array.isArray(fetchedData)) {
    console.log('Error fetching data!');
    return;
  }
  data = prepareData(fetchedData);
  createChart();
});
