/* eslint no-console: "off", no-debugger: "off", no-unused-vars: "off", react/prop-types:"off", no-undef: "off", react/jsx-no-undef: "off", react/no-direct-mutation-state: "off" */
import React from'react';
import{ Modal, Button, Input, Menu, Dropdown, Icon, message } from'antd';


function handleButtonClick(e) {
    console.log('click left button', e);
}


export default class ToggleOpenFVA extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            visible: false,
            fvaOpenYear: this.getFvaYearOpen(),
            newFvaYear: '',
            years: [],
            input: true
        };
    }

    showModal() {
        $('input[name=newFvaYear]').val('');
        this.setState({
            visible: true,
        });
    }

    handleMenuClick(e) {
        if(e.key === 'newYear') {
            this.setState({
                newFvaYear: '',
                input: false
            });

            $('input[name=newFvaYear]').focus().val('');
        }
        else{
            this.setState({
                newFvaYear: e.key,
                input: true
            });

            $('input[name=newFvaYear]').val(e.key);
        }
    }


    handleOk() {
        this.setState({ loading: true });

        this.saveFVAStatus().bind(this);
    }
    handleCancel() {
        this.setState({ visible: false });
    }

    getFvaYearOpen() {
        $.ajax({
            url: MapasCulturais.createUrl('panel', 'fvaOpenYear'),
            type: 'GET',
            dataType:'json',
        }).done(function(data) {
            this.setState({fvaOpenYear: data});
        }.bind(this));
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

    //Testa se o valor digitado é um ano (YYYY)
    testYear() {
        if(/^([0-9]{4})$/.test($('input[name=newFvaYear]').val())) {
            this.setState({newFvaYear: $('input[name=newFvaYear]').val()});
        }
    }

    closeFVA() {
        this.setState({
            newFvaYear: false,
            fvaOpenYear: false
        });

        this.saveFVAStatus();
    }


    saveFVAStatus() {
        this.setState({ loading: true });

        const self = this;

        $.ajax({
            url: MapasCulturais.createUrl('panel', 'fvaOpenYear'),
            type: 'POST',
            data: JSON.stringify(self.state.newFvaYear),
            dataType:'json'
        }).done(function() {

        });

        self.setState({
            loading: false,
            fvaOpenYear: self.state.newFvaYear,
            newFvaYear: '',
            visible: false
        });
    }

    render() {

        const menu = (
            <Menu onClick={this.handleMenuClick.bind(this)} defaultOpenKeys={['newYear']}>
                {this.state.years.length > 0 ?
                    (this.state.years.map((year, index) => <Menu.Item key={year.year
                    }>{year.year}</Menu.Item>))
                    : null
                }
                <Menu.Item key="newYear">Adicionar Novo Ano</Menu.Item>
            </Menu>
        );


        let button = null;

        if(this.state.fvaOpenYear) {
            button = <Button type="danger" onClick={this.closeFVA.bind(this)}>Fechar Questionário {this.state.fvaOpenYear}</Button>;
        }
        else{
            button = <Button type="primary" onClick={this.showModal.bind(this)}>Abrir Questionário</Button>;
        }

        const{ visible, loading } = this.state;
        return(
            <div>
                {button}
                <Modal
                    visible={visible}
                    title="Abrir FVA"
                    onOk={this.saveFVAStatus.bind(this)}
                    onCancel={this.handleCancel.bind(this)}
                    footer={[
                        <Button key="back" onClick={this.handleCancel.bind(this)}>Cancelar</Button>,
                        <Button key="submit" type="primary" loading={this.state.loading} onClick={this.saveFVAStatus.bind(this)} disabled={this.state.newFvaYear === '' ? true : false}>Abrir FVA</Button>,
                    ]}
                >

                    <div>
                        <Dropdown.Button onClick={handleButtonClick} overlay={menu} style={{float: 'right'}}>
                              Selecione o Ano
                        </Dropdown.Button>
                    </div>

                    <p>Escolha o ano para abertura do questionário</p>
                    <Input name="newFvaYear" pattern="[0-9]{4}" onKeyUp={this.testYear.bind(this)} placeholder={this.state.newFvaYear === '' ? 'Digite aqui o ano' : ''} />


                </Modal>
            </div>
        );
    }
}
