/* eslint no-console: "off", no-debugger: "off", no-unused-vars: "off", react/prop-types:"off", no-undef: "off", react/jsx-no-undef: "off", react/no-direct-mutation-state: "off" */
import React from'react';
import ReactDOM from'react-dom';
//import AdminPanel from'./components/Panel/AdminPanel.jsx';
import PanelYear from'./components/Panel/PanelYear.jsx';
import ToggleOpenFVA from'./components/Toggle/ToggleOpenFVA.jsx';
import SelectFVAYear from'./components/Select/SelectFVAYear.jsx';
import ComparativeChart from'./components/Panel/ComparativeChart.jsx';
import ErrorBoundary from'./components/Exceptions/ErrorBoundary.jsx';

class FVA extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedYear: null,
            openYear:     null
        };
        this.updateOpenYear = this.updateOpenYear.bind(this);
        this.updateYear = this.updateYear.bind(this);
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
                    <ErrorBoundary>
                        <ToggleOpenFVA updateOpenYear={this.updateOpenYear} />
                    </ErrorBoundary>
                    <ErrorBoundary>
                        <SelectFVAYear updateYear={this.updateYear} />
                    </ErrorBoundary>
                </div>

                <ErrorBoundary>
                    <PanelYear selectedYear={this.state.selectedYear} openYear={this.state.openYear}/>
                </ErrorBoundary>

                <ErrorBoundary> <ComparativeChart /> </ErrorBoundary>
            </div>
        );
    }
}

$(document).ready(function() {
    ReactDOM.render(<FVA />, document.getElementById('root'));
});
