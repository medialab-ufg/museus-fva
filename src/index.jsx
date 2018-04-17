/* eslint no-console: "off", no-debugger: "off", no-unused-vars: "off", react/prop-types:"off", no-undef: "off", react/jsx-no-undef: "off", react/no-direct-mutation-state: "off" */
import React from'react';
import ReactDOM from'react-dom';
//import AdminPanel from'./components/Panel/AdminPanel.jsx';
import _ from'lodash';

import PanelYear from'./components/Panel/PanelYear.jsx';
import ToggleOpenFVA from'./components/Toggle/ToggleOpenFVA.jsx';
import SelectFVAYear from'./components/Select/SelectFVAYear.jsx';
import ComparativeChart from'./components/Panel/ComparativeChart.jsx';

class FVA extends React.Component {
    constructor() {
        super();

        this.state = {
            selectedYear: null,
            openYear:     null
        };
    }

    updateYear(e) {
        this.setState({selectedYear: e.key});
    }

    updateOpenYear(e) {
        this.setState({openYear: e});
    }

    render() {
        return(
            <div>
                <div id="toobar-fva">
                    <ToggleOpenFVA updateOpenYear={this.updateOpenYear.bind(this)}/>
                    <SelectFVAYear updateYear={this.updateYear.bind(this)}/>
                </div>

                <PanelYear selectedYear={this.state.selectedYear} openYear={this.state.openYear}/>
                
                <ComparativeChart />
            </div>
        );
    }
}

$(document).ready(function() {
    ReactDOM.render(<FVA />, document.getElementById('root'));
});
