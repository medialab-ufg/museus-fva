/* eslint no-console: "off", no-debugger: "off", no-unused-vars: "off", react/prop-types:"off", no-undef: "off", react/jsx-no-undef: "off", react/no-direct-mutation-state: "off" */
import React from 'react';
import { Button } from 'antd';

export default class Excel extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            filteredMuseums: this.props.filteredMuseums
        };

        this.generateXls = this.generateXls.bind(this);
    }


    getDerivedStateFromProps(nextProps) {
        if(this.state.filteredMuseums !== nextProps.filteredMuseums) {
            this.setState({
                filteredMuseums: nextProps.filteredMuseums
            });
        }
    }

    generateXls() {
        $.ajax({
            url: MapasCulturais.createUrl('panel', 'generate-xls'),
            type: 'POST',
            data: JSON.stringify(this.state.filteredMuseums),
            dataType:'json',
        }).done(function(data) {
            let $a = $('<a>');
            $a.attr('href', data.file);
            $('body').append($a);
            $a.attr('download', `Relatorio_FVA_${data.year}.xls`);
            $a[0].click();
            $a.remove();
        });
    }

    render() {
        return(
            <Button type="primary" icon="download" size='large' id='btn-generate-report' onClick={this.generateXls}>Gerar Relatório</Button>
        );
    }
}
