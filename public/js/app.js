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
  data2Border: '#666',
  data2Background: 'rgba(0, 0, 0, 0.4)'
  data3Border: '#333',
  data3Background: 'rgba(0, 0, 0, 0.3)'
};
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  colors = {
    labels: '#aaa',
    lines: 'rgba(255, 255, 255, 0.2)',
    data1Border: '#fff',
    data1Background: 'rgba(255, 255, 255, 0.2)',
    data2Border: '#777',
    data2Background: 'rgba(255, 255, 255, 0.4)',
    data3Border: '#ccc',
    data3Background: 'rgba(255, 255, 255, 0.3)',
  };
}

function createTable(type) {
  var statTypes = ['Cases', 'Deaths'];
  if (type == 'total') {
    statTypes.push('Current');
  }
  var i, j;
  var table = document.createElement('table');

  var caption = document.createElement('caption');
  caption.textContent = type + ' counts';
  table.appendChild(caption);
  var headerRow = document.createElement('tr');
  var th = document.createElement('td');
  headerRow.appendChild(th);
  for (i = 0; i < statTypes.length; i++) {
    th = document.createElement('th');
    th.textContent = statTypes[i];
    th.setAttribute('scope', 'col');
    headerRow.appendChild(th);
  }
  table.appendChild(headerRow);

  for (i = 0; i < data.labels.length; i++) {
    var row = document.createElement('tr');
    var th = document.createElement('th');
    th.setAttribute('scope', 'row');
    th.textContent = data.labels[i];
    row.appendChild(th);

    for (j = 0; j < statTypes.length; j++) {
      var statType = statTypes[j].toLowerCase();
      var td = document.createElement('td');
      td.textContent = data[type][statType][i];
      row.appendChild(td);
    }
    table.appendChild(row);
  }

  return table;
}

function createChart() {
  var canvas = document.getElementById('chart');
  canvas.textContent = '';
  canvas.appendChild(createTable('total'));
  canvas.appendChild(createTable('new'));

  var ctx = canvas.getContext('2d');
  var chartConfig = {
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
  };

  if (dataType = 'total') {
    chartConfig.data.datasets.push({
      label: 'Current',
      borderColor: colors.data3Border,
      backgroundColor: colors.data3Background,
      data: data[dataType].current
    });
  }

  chart = new Chart(ctx, chartConfig);
}

function updateDataType(type) {
  dataType = type;
  localStorage.setItem('dataType', type);

  if (!chart) { return; }
  chart.data.labels = data.labels;
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

function calculateCurrent(day, index, array) {
  var recoveryDays = 21;
  if (index < recoveryDays) {
    return day.cases;
  } else {
    var reportedDay = array[index - recoveryDays];
    return Math.max(day.cases - reportedDay.cases, 0);
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
      current: data.map(function(day, index) {
        return calculateCurrent(day, index, data);
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

function fetchStats() {
  fetch('stats.php')
  .then(function(res) {
    return res.json();
  }).then(function(fetchedData) {
    if (! Array.isArray(fetchedData)) {
      console.log('Error fetching data!');
      return;
    }
    data = prepareData(fetchedData);

    if (chart) {
      chart.destroy();
    }
    createChart();
  });
}


document.querySelectorAll('input[name="dataToggle"]').forEach(function(input) {
  if (input.value == dataType) {
    input.checked = true;
  }
  input.addEventListener('change', function() {
    updateDataType(this.value);
  });
});

document.getElementById('refresh').addEventListener('click', function(event) {
  event.preventDefault();
  fetchStats();
});

fetchStats();
