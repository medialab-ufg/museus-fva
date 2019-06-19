/* eslint no-console: "off", no-debugger: "off", no-unused-vars: "off", react/prop-types:"off", no-undef: "off", react/jsx-no-undef: "off", react/no-direct-mutation-state: "off" */
import React from'react';
import PieChart from'./PieChart.jsx';
import MuseusTable from'./MuseusTable.jsx';
import Excel from'./Excel.jsx';
import _ from'lodash';
import'./panel.css';

export default class PanelYear extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            selectedYear:    null,
            openYear:        null,
            museus:          null,
            respostas:       null,
            percentual:      null,
            dataVisible:     false,
            filteredMuseums: null
        };

        this.calculatePercentual = this.calculatePercentual.bind(this);
    }

    //Conta os questionários respondidos
    countFvasRespondidos(museusJson, year) {
        const self = this;
        const totalMuseus = museusJson.length;
        let respondidos = 0;
        let naoRespondidos = 0;

        _.each(museusJson, function(value, key) {
            _.each(value, function(value, key) {
                if(key === 'fva' + year) {
                    if(value !== null) {
                        respondidos++;
                    }
                }
            });
        });

        naoRespondidos = totalMuseus - respondidos;

        return{respondidos, naoRespondidos};
    }

    //Calcula o porcentual de respostas
    calculatePercentual(totalMuseus, totalMuseusResponderam) {
        const percentualRespondido = _.round(totalMuseusResponderam.respondidos / totalMuseus * 100, 2);
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

    //Atualiza os dados dos museus do ano selecionado
    updateMuseus(year) {
        this.setState({dataVisible: false});

        $.ajax({
            url: MapasCulturais.baseURL + 'api/space/find/?@select=name,fva' + year + ',emailPublico,En_Estado,En_Municipio,telefonePublico,mus_cod',
            type: 'GET',
            dataType:'json',
        }).done(function(data) {
            const self = this;
            this.setState({
                museus:          data,
                respostas:       self.countFvasRespondidos(data, year),
                percentual:      self.calculatePercentual(data.length, this.countFvasRespondidos(data, year)),
                dataVisible:     true,
                filteredMuseums: data.filter((element) => {
                    return element['fva' + year] !== null;
                })
            });

        }.bind(this));
    }

    //filtra os museus que responderam o FVA para gerar o relatório em planilha
    filterMuseums() {
        const self = this;
        this.setState({filteredMuseums: this.state.museus.filter((element) => {
            return element['fva' + self.state.selectedYear] !== null;
        })
        });
    }

    componentDidMount() {
        //Assume como dado padrão, o do último FVA realizado
        $.ajax({
            url: MapasCulturais.createUrl('panel', 'lastFvaOpenYear'),
            type: 'GET',
            dataType:'json',
        }).done(function(data) {
            this.setState({selectedYear: data});
            this.updateMuseus(data);
        }.bind(this));
    }

    componentWillReceiveProps(nextProps) {
        //Se houver diferença entre o ano do state e o da props, atualiza os dados
        if(nextProps.selectedYear !== this.state.selectedYear) {
            this.setState({selectedYear: nextProps.selectedYear});
            this.updateMuseus(nextProps.selectedYear);
        }

        if(nextProps.openYear !== this.state.openYear) {
            this.setState({openYear: nextProps.openYear});
        }
    }

    render() {

        if(!this.state.selectedYear && !this.state.dataVisible) {
            return false;
        }
        else{
            return(
                <div>
                    {this.state.dataVisible ?
                        <div id="panel-container">
                            <h2>Relatório {this.state.selectedYear}</h2>

                            <div id="counter-container">
                                <div className="header-count">
                                    <div className="count-responderam">
                                        <p>Museus Responderam</p>
                                        <div className="count-number">{this.state.respostas.respondidos}</div>
                                    </div>
                                    <div className="count-nao-responderam">
                                        <p>Museus Não Responderam</p>
                                        <div className="count-number">{this.state.respostas.naoRespondidos}</div>
                                    </div>
                                </div>
                            </div>

                            <PieChart percentual={this.state.percentual} />

                            <MuseusTable museus={this.state.museus} parentHandler={this.updateMuseus} fvaYear={this.state.selectedYear} openYear={this.state.openYear} />

                            <Excel filteredMuseums={this.state.filteredMuseums}/>
                        </div>
                        :
                        <div id="loading">
                            <div className="lds-ring"><div></div><div></div><div></div><div></div></div>
                        </div>
                    }
                </div>
            );
        }
    }
}
