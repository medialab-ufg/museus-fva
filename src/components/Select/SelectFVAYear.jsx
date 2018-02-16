/* eslint no-console: "off", no-debugger: "off", no-unused-vars: "off", react/prop-types:"off", no-undef: "off", react/jsx-no-undef: "off", react/no-direct-mutation-state: "off" */
import React from'react';
import'antd/dist/antd.css';
import'./antd.css';
import{ Menu, Dropdown, Button, Icon, message } from'antd';

function handleButtonClick(e) {
    message.info('Click on left button.');
    console.log('click left button', e);
}

function handleMenuClick(e) {
    message.info('Click on menu item.');
    console.log('click', e);
}



export default class SelectFVAYear extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            value: 1,
            years: this.yearsAvailable()
        };
    }

    yearsAvailable() {
        $.ajax({
            url: MapasCulturais.createUrl('panel', 'fvaYearsAvailable'),
            type: 'GET',
            dataType:'json',
        }).done(function(data) {
            console.log(data);
            this.setState({years: data});
        }.bind(this));
    }


    render() {

        let itens = null;

        const menu = (
            <Menu onClick={handleMenuClick}>
                {() => {
                    this.state.years.map(l =>
                        <Menu.Item key="3">{l.name}</Menu.Item>
                    );
                }
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
