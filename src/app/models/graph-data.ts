import { BarComponent } from '../components/d3/bar/bar.component';
import { PieComponent } from '../components/d3/pie/pie.component';
import { Graph } from './Graphs';

export const GRAPHS: Graph[] = [

{
    type: 'bar',
    image: '../../assets/img/BarSmall.png',
    title: 'Diagrama de barras',
    component: BarComponent
    // Puedo añadir un tipo de estructura de data y comprobar que cuando metan una estructura de datos coincida con la de la gráfica elegida
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
    component: ''
},
{
    type: 'scatter',
    image: '../../assets/img/ScatterConnectedSmall.png',
    title: 'Diagrama de dispersión',
    component: ''
},
{
    type: 'box',
    image: '../../assets/img/Box1Small.png',
    title: 'Diagrama de caja',
    component: ''
},{
    type: 'dendrogram',
    image: '../../assets/img/DendrogramSmall.png',
    title: 'Dendrograma',
    component: ''
},
{
    type: 'tree',
    image: '../../assets/img/TreeSmall.png',
    title: 'Árbol',
    component: ''
}

]

