/* eslint no-console: "off", no-debugger: "off", no-unused-vars: "off", react/prop-types:"off", no-undef: "off", react/jsx-no-undef: "off", react/no-direct-mutation-state: "off" */
import React from'react';
import'antd/dist/antd.css';
import'./antd.css';
import{ Menu, Dropdown, Button, Icon, message } from'antd';

function handleButtonClick(e) {
    console.log('click left button', e);
}

function handleMenuClick(e) {
    console.log('click', e);
}



export default class SelectFVAYear extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            years: []
        };
    }

    componentDidMount() {
        $.ajax({
            url: MapasCulturais.createUrl('panel', 'fvaYearsAvailable'),
            type: 'GET',
            dataType:'json',
        }).done(function(data) {
            this.setState({years: data});
        }.bind(this));
    }


    render() {
        const menu = (
            <Menu onClick={handleMenuClick}>
                {this.state.years.length > 0 ?
                    (this.state.years.map((year, index) => <Menu.Item key={year.year}>{year.year}</Menu.Item>))
                    : null
                }
            </Menu>
        );

        return(
            <div>
                <Dropdown.Button onClick={handleButtonClick} overlay={menu} style={{float: 'right'}}>
                  Selecione o Ano
                </Dropdown.Button>
            </div>
        );
    }
}
