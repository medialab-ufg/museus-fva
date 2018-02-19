/* eslint no-console: "off", no-debugger: "off", no-unused-vars: "off", react/prop-types:"off", no-undef: "off", react/jsx-no-undef: "off", react/no-direct-mutation-state: "off" */
import React from'react';
import{ Modal, Button, Input } from'antd';



export default class ToggleOpenFVA extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            visible: false,
            fvaYear: this.getFvaYearOpen()
        };
    }

    showModal() {
        this.setState({
            visible: true,
        });
    }

    handleOk() {
        this.setState({ loading: true });
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
            this.setState({fvaYear: data});
        }.bind(this));
    }

    closeFVA() {
        this.setState({
            fvaYear: false,
        });
    }


    saveFVAStatus(status) {
        const self = this;

        $.ajax({
            url: MapasCulturais.createUrl('panel', 'openFVA'),
            type: 'POST',
            data: JSON.stringify(status),
            dataType:'json',
        });
    }

    render() {

        let button = null;

        if(this.state.fvaYear) {
            button = <Button type="danger" onClick={this.closeFVA.bind(this)}>Fechar Questionário {this.state.fvaYear}</Button>;
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
                    onOk={this.handleOk.bind(this)}
                    onCancel={this.handleCancel.bind(this)}
                    footer={[
                        <Button key="back" onClick={this.handleCancel.bind(this)}>Cancelar</Button>,
                        <Button key="submit" type="primary" loading={loading} onClick={this.handleOk.bind(this)}>Abrir FVA</Button>,
                    ]}
                >
                    <p>Digite o ano para abertura do questionário</p>
                    <Input name="fvaYear" />
                </Modal>
            </div>
        );
    }
}
