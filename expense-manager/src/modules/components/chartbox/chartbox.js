import { LightningElement, api } from "lwc";
import Chart from 'chart.js/auto'
export default class Chartbox extends LightningElement{
    chart
    chartLoaded = false
    _data = []
    labels = []
    results
    @api 
    get chartRecords(){
        return this._data
    }
    set chartRecords(data){
        this._data = [...data.results]
        this.labels = [...data.labels]
        if(this.chartLoaded){
            const elem = this.template.querySelector('.chart')
            elem.innerHTML=''
            this.chart.destroy()
            this.renderChart()
        }
        //
    }
    renderedCallback(){
        if(this.chartLoaded){
            return
        }
        const elem = this.template.querySelector('.chart')
        if(elem){
            this.renderChart()
        }
    }

    renderChart(){
        const elem = this.template.querySelector('.chart')
        const config = {
            type: 'doughnut',
            data: {
                labels: this.labels,
                datasets: [{
                  label: 'Total Amount',
                  data: this._data,
                  hoverOffset: 4
                }]
              }
          };
        const canvas = document.createElement('canvas')
        elem.appendChild(canvas)
        const ctx = canvas.getContext('2d')
        this.chart = new Chart(ctx, config)
        this.chartLoaded = true
    }
}