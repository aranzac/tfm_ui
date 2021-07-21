import { BarComponent } from '../components/d3/bar/bar.component';
import { BoxComponent } from '../components/d3/box/box.component';
import { DendrogramComponent } from '../components/d3/dendrogram/dendrogram.component';
import { DonutComponent } from '../components/d3/donut/donut.component';
import { PieComponent } from '../components/d3/pie/pie.component';
import { ScatterComponent } from '../components/d3/scatter/scatter.component';
import { Graph } from './Graphs';

export const GRAPHS: Graph[] = [

    {
        type: 'bar',
        image: '../../assets/img/BarSmall.png',
        title: 'Diagrama de barras',
        component: BarComponent
    },
    {
        type: 'pie',
        image: '../../assets/img/PieSmall.png',
        title: 'Diagrama de tarta',
        component: PieComponent
    },
    {
        type: 'donut',
        image: '../../assets/img/DougnutSmall.png',
        title: 'Donut',
        component: DonutComponent
    },
    {
        type: 'scatter',
        image: '../../assets/img/ScatterConnectedSmall.png',
        title: 'Diagrama de dispersión',
        component: ScatterComponent
    },
    {
        type: 'box',
        image: '../../assets/img/Box1Small.png',
        title: 'Diagrama de caja',
        component: BoxComponent
    }

]

