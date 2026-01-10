<template>
  <div>
      <ApexCharts
          :options="chartOptionsComputed"
          :series="series"
          :width="dialogWidth-20"
      ></ApexCharts>
  </div>
</template>

<script>
import ApexCharts from 'vue3-apexcharts'

export default {
  name: "IndikatorResultChart",
  props: {
    dialogWidth: Number,
    series1: Array,
    labels1: Array,
    chartType: String,
  },
  components: {
    ApexCharts: ApexCharts,
  },
  watch: {
    series1: {
      handler: function (value) {
        if (value.length > 0) {
          this.series = [{ data: value }];
        }
      },
      immediate: true
    },
    labels1: {
      handler: function (value) {
        if (value.length > 0) {
          this.labels = value;
        }
      },
      immediate: true
    }
  },
  data: function() {
    return {
      labels: this.labels1.length ? this.labels1 : ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'],
      series: this.series1.length ? [{ data: this.series1 }] : [{ data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 14, 15] }],
    }
  },
  computed: {
    labelsComputed() {
      return this.labels1;
    },
    chartOptionsComputed() {
      return {
        chart: {
          width: this.dialogWidth - 20,
          type: this.chartType || 'bar',
          height: 350,
        },
        colors: ['#218319'],
        plotOptions: {
          bar: {
            //Tidak berhasil
            // distributed: true, // This enables different colors for each bar
          }
        },
        xaxis: {
          categories: this.labelsComputed,
        },
        fill: {
          type: 'gradient',
        },
        legend: {
          formatter: function (val, opts) {
            let value = opts.w.globals.series[opts.seriesIndex][opts.dataPointIndex];
            let valueStr = "";
            if (value / 1000000000000 > 1) {
              valueStr = `${parseFloat(value / 1000000000000).toFixed(2)} Triliun`;
            } else if (value / 1000000000 > 1) {
              valueStr = `${parseFloat(value / 1000000000).toFixed(2)} Miliar`;
            } else if (value / 1000000 > 1) {
              valueStr = `${parseFloat(value / 1000000).toFixed(2)} Juta`;
            } else if (value / 1000 > 1) {
              valueStr = `${parseFloat(value / 1000).toFixed(2)} Ribu`;
            } else {
              valueStr = value.toString();
            }

            return val + " - " + valueStr;
          },
          position: "right",
        },
        dataLabels: {
          enabled: true,
          formatter: function (value) {
            let valueStr = "";
            if (value / 1000000000000 > 1) {
              valueStr = `${parseFloat(value / 1000000000000).toFixed(2)} Triliun`;
            } else if (value / 1000000000 > 1) {
              valueStr = `${parseFloat(value / 1000000000).toFixed(2)} Miliar`;
            } else if (value / 1000000 > 1) {
              valueStr = `${parseFloat(value / 1000000).toFixed(2)} Juta`;
            } else if (value / 1000 > 1) {
              valueStr = `${parseFloat(value / 1000).toFixed(2)} Ribu`;
            } else {
              valueStr = value.toString();
            }
            return valueStr;
          },
          style: {
            colors: ['#000'], // Warna teks
            fontSize: '12px', // Ukuran font
            fontWeight: 'bold', // Ketebalan font
          },
          offsetY: -20, // Posisi Y dari label
          dropShadow: {
            enabled: true,
            top: 1,
            left: 1,
            blur: 1,
            opacity: 0.45
          }
        },
        tooltip: {
          y: {
            formatter: function (value) {
              let valueStr = "";
              if (value / 1000000000000 > 1) {
                valueStr = `${parseFloat(value / 1000000000000).toFixed(2)} Triliun`;
              } else if (value / 1000000000 > 1) {
                valueStr = `${parseFloat(value / 1000000000).toFixed(2)} Miliar`;
              } else if (value / 1000000 > 1) {
                valueStr = `${parseFloat(value / 1000000).toFixed(2)} Juta`;
              } else if (value / 1000 > 1) {
                valueStr = `${parseFloat(value / 1000).toFixed(2)} Ribu`;
              } else {
                valueStr = value.toString();
              }

              return valueStr;
            }
          }
        },
        responsive: [{
          options: {
            chart: {
              type: 'bar'
            },
            legend: {
              position: 'bottom'
            }
          },
        }]
      }
    }
  },
  mounted() {
    // Mengatur nilai awal series dan labels jika belum diatur
    if (this.series1.length > 0) {
      this.series = [{ data: this.series1 }];
    }
    if (this.labels1.length > 0) {
      this.labels = this.labels1;
    }
  }
}
</script>

<style scoped>

</style>
