/* eslint no-console: "off", no-debugger: "off", no-unused-vars: "off", react/prop-types:"off", no-undef: "off", react/jsx-no-undef: "off", react/no-direct-mutation-state: "off" */
import React from'react';
import'./panel.css';

export default class PanelYear extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            selectedYear: this.props.selectedYear,
            museus:       null,
            respostas:    null,
        };
    }


    countFvasRespondidos(museusJson) {
        const self = this;
        const totalMuseus = museusJson.length;
        let respondidos = 0;
        let naoRespondidos = 0;

        _.each(museusJson, function(value, key) {
            _.each(value, function(value, key) {
                if(key === 'fva' + self.props.selectedYear) {
                    if(value !== null) {
                        respondidos++;
                    }
                }
            });
        });

        naoRespondidos = totalMuseus - respondidos;

        return{respondidos, naoRespondidos};
    }

    updateMuseus() {
        $.ajax({
            url: MapasCulturais.createUrl('api', 'space/find/?@select=name,fva' + this.props.selectedYear + ',emailPublico,En_Estado,En_Municipio,telefonePublico,mus_cod'),
            type: 'GET',
            dataType:'json',
        }).done(function(data) {
            this.setState({
                museus: data,
                respostas: this.countFvasRespondidos(data)
            });
        }.bind(this));
    }

    componentDidMount() {
        this.updateMuseus();
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.selectedYear !== this.state.selectedYear) {
            this.setState({selectedYear: nextProps.selectedYear});

            this.updateMuseus();
        }
    }

    render() {
        if(this.state.selectedYear !== null) {
            return(
                <div id="panel-container">
                    <h2>Relatório {this.props.selectedYear}</h2>

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
                </div>
            );
        }
        else{
            return false;
        }
    }
}
