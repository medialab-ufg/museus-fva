import React from'react';
import PropTypes from'prop-types';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { error: null, errorInfo: null };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
    }

    render() {
        if(this.state.errorInfo) {
            return(
                <div>
                    <p>Componente não pode ser carregado neste momento.</p>
                    <details style={{ whiteSpace: 'pre-wrap' }}>
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.errorInfo.componentStack}
                    </details>
                </div>
            );
        }

        if(this.props.children) {
            return this.props.children;
        }
    }
}

ErrorBoundary.propTypes = {
    children: PropTypes.node.isRequired
};

export default ErrorBoundary;