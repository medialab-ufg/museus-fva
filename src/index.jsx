/* eslint no-console: "off", no-debugger: "off", no-unused-vars: "off", react/prop-types:"off", no-undef: "off", react/jsx-no-undef: "off", react/no-direct-mutation-state: "off" */
import React from'react';
import ReactDOM from'react-dom';
//import AdminPanel from'./components/Panel/AdminPanel.jsx';
import _ from'lodash';

import PanelYear from'./components/Panel/PanelYear.jsx';
import ToggleOpenFVA from'./components/Toggle/ToggleOpenFVA.jsx';
import SelectFVAYear from'./components/Select/SelectFVAYear.jsx';

/*class Index extends React.Component {
    constructor() {
        super();

        this.state = {
            museusData:           null,
            selectedYear:         5002,
            _qtdRespostas:        null,
            _percentualRespostas: null,
            _filteredMuseums:     null,
        };

        this.fetchMuseus          = this.fetchMuseus.bind(this);
        this.updateState          = this.updateState.bind(this);
        this.filterMuseums        = this.filterMuseums.bind(this);
    }

    componentWillMount() {
        this.updateState();
    }

    countFvasRespondidos(museusJson) {
        const self = this;
        const totalMuseus = museusJson.length;
        let respondidos = 0;
        let naoRespondidos = 0;

        _.each(museusJson, function(value, key) {
            _.each(value, function(value, key) {
                if(key === 'fva' + self.state.selectedYear) {
                    if(value !== null) {
                        respondidos++;
                    }
                }
            });
        });

        naoRespondidos = totalMuseus - respondidos;

        return{respondidos, naoRespondidos};
    }

    fetchMuseus() {
        const endpointURL = MapasCulturais.baseURL + 'api/space/find/?@select=name,fva' + this.state.selectedYear + ',emailPublico,En_Estado,En_Municipio,telefonePublico,mus_cod';
        //const endpointURL = 'http://museus.mapas.local:8090/api/space/find/?@select=name,fva2018,emailPublico,En_Estado,En_Municipio,telefonePublico,mus_cod';

        fetch(endpointURL, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        })
            .then(response => {
                response.json()
                    .then(data => {
                        const qtdRespostas = this.countFvasRespondidos(data);
                        const percentualRespostas = calculatePercentual(data.length, qtdRespostas.respondidos);

                        this.setState({
                            museusData: data,
                            _qtdRespostas: qtdRespostas,
                            _percentualRespostas: percentualRespostas
                        });
                    });
            });

        /**
         * Contabiliza o número de museus que já responderam o FVA
         * @param {JSON} museusJson
         * @return {OBJ}
         */

/**
         * Contabiliza o percentual de museus que responderam o FVA
         * @param {INT} totalMuseus
         * @param {INT} totalMuseusResponderam
         * @return {INT}
         */
/*function calculatePercentual(totalMuseus, totalMuseusResponderam) {
            const percentualRespondido = _.round(totalMuseusResponderam / totalMuseus * 100, 2);
            let totalPercent = [];

            //tratamento para os casos de 100%, 0% e os parcialmente respondidos
            if(percentualRespondido === 100) {
                totalPercent = [100, 0];
            }
            else if(percentualRespondido === 0) {
                totalPercent = [0, 100];
            }
            else{
                totalPercent = [percentualRespondido, 100 - percentualRespondido];
            }

            return totalPercent;
        }
    }

    //update o estado da aplicação
    updateState(e = null) {
        if(e !== null) {
            this.setState({selectedYear: e.key});
        }

        this.fetchMuseus();
    }

    //filtra os museus que responderam o FVA para gerar o relatório em planilha
    filterMuseums() {
        const self = this;
        this.state._filteredMuseums = this.state.museusData.filter((element) => {
            return element['fva' + self.state.selectedYear] !== null;
        });
    }

    render() {
        if(this.state.museusData !== null) {
            this.filterMuseums();


            return(
                <AdminPanel
                    museus          = {this.state.museusData}
                    respostas       = {this.state._qtdRespostas}
                    percentual      = {this.state._percentualRespostas}
                    parentHandler   = {this.updateState}
                    filteredMuseums = {this.state._filteredMuseums}
                    fvaYear         = {this.state.selectedYear}
                />
            );
        }
        else{
            return null;
        }
    }
}*/


class FVA extends React.Component {
    constructor() {
        super();

        this.state = {
            selectedYear: null
        };
    }

    updateYear(e) {
        this.setState({selectedYear: e.key});
        console.log(this.state.selectedYear);
    }

    render() {
        return(
            <div>
                <ToggleOpenFVA />
                <SelectFVAYear updateYear={this.updateYear.bind(this)}/>

                <PanelYear selectedYear={this.state.selectedYear}/>
            </div>
        );
    }
}

$(document).ready(function() {
    ReactDOM.render(<FVA />, document.getElementById('root'));
});
