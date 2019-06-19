/* eslint no-console: "off", no-debugger: "off", no-unused-vars: "off", react/prop-types:"off", no-undef: "off", react/jsx-no-undef: "off", react/no-direct-mutation-state: "off" */
import React from'react';
import{ Button } from'antd';

export default class Excel extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            filteredMuseums: this.props.filteredMuseums
        };

        this.generateXls = this.generateXls.bind(this);
    }


    componentWillReceiveProps(nextProps) {
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
            data: JSON.stringify(this.state.filteredMuseums)
        }).done(function(data) {
            if(data) {
                let res = JSON.parse(data);
                let fileName = 'Relatório_FVA_' + res.year + '.xls';
                let _file = res.file;
                let $a = $('<a>');
                $a.attr('href', _file);
                $('body').append($a);
                $a.attr('download', fileName);
                $a[0].click();
                $a.remove();
            }
        }).fail(function(jqXHR, textStatus) {
            console.log(textStatus + ': Não foi possível gerar o Relatório do FVA.');
        });
    }

    render() {
        return(
            <Button type="primary" icon="download" size='large' id='btn-generate-report' onClick={this.generateXls}>Gerar Relatório</Button>
        );
    }
}
