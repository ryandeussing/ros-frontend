import React, { Suspense } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { PrimaryToolbar } from '@redhat-cloud-services/frontend-components/PrimaryToolbar';
import { TableToolbar } from '@redhat-cloud-services/frontend-components/TableToolbar';
import { loadSysRecs } from '../../store/actions';
import {
    Card,
    CardHeader,
    CardBody,
    Title,
    Stack,
    StackItem,
    Pagination
} from '@patternfly/react-core';

import asyncComponent from '../../Utilities/asyncComponent';
const RecommendationsTable = asyncComponent(() => import('./RecommendationsTable'));

/**
 * This is a dumb component that only recieves properties from a smart component.
 * Dumb components are usually functions and not classes.
 *
 * @param props the props given by the smart component.
 */

class SystemRecommendations extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            page: 1,
            perPage: 10,
            inventoryId: props.match.params.inventoryId
        };
    }

    async componentDidMount() {
        await window.insights.chrome.auth.getUser();
        this.props.loadSysRecs(this.state.inventoryId,
            { page: this.state.page, perPage: this.state.perPage }
        );
    }

    updatePagination(pagination) {
        this.setState(pagination);
        this.props.loadSysRecs(this.state.inventoryId, pagination);
    }

    render() {
        const { totalRecs, recsData  } = this.props;
        const { page, perPage } = this.state;
        return (
            <Suspense fallback="">
                <Stack>
                    <StackItem>
                        <Card>
                            <CardHeader><Title headingLevel="h1">Recommendations</Title></CardHeader>
                            <CardBody>
                                <PrimaryToolbar className="ros-primary-toolbar" pagination={{
                                    page: (totalRecs === 0 ? 0 : page),
                                    perPage,
                                    itemCount: (totalRecs ? totalRecs : 0),
                                    onSetPage: (_e, page) => this.updatePagination({ page, perPage: this.state.perPage }),
                                    onPerPageSelect: (_e, perPage) => this.updatePagination({ page: 1, perPage }),
                                    isCompact: true,
                                    widgetId: 'ros-pagination-top'
                                }}
                                />
                                { (!this.props.loading) ? (<RecommendationsTable recommendations = { recsData }/>) : null }
                                <TableToolbar>
                                    <Pagination
                                        itemCount={ totalRecs ? totalRecs : 0 }
                                        widgetId='ros-pagination-bottom'
                                        page={ totalRecs === 0 ? 0 : page }
                                        perPage={ perPage }
                                        variant='bottom'
                                        onSetPage={(_e, page) => this.updatePagination({ page, perPage: this.state.perPage })}
                                        onPerPageSelect={(_e, perPage) => this.updatePagination({ page: 1, perPage })}
                                    />
                                </TableToolbar>

                            </CardBody>
                        </Card>
                    </StackItem>
                </Stack>
            </Suspense>
        );
    }
}

SystemRecommendations.propTypes = {
    match: PropTypes.any,
    loading: PropTypes.bool,
    recsData: PropTypes.array,
    totalRecs: PropTypes.number,
    loadSysRecs: PropTypes.func
};

const mapStateToProps = (state, props) => {
    return {
        loading: state.systemRecsReducer && state.systemRecsReducer.loading,
        recsData: state.systemRecsReducer &&
            state.systemRecsReducer.recommendationsData,
        totalRecs: state.systemRecsReducer &&
            state.systemRecsReducer.totalRecommendations,
        ...props
    };
};

function mapDispatchToProps(dispatch) {
    return {
        loadSysRecs: (uuid, params = {}) => dispatch(loadSysRecs(uuid, params))
    };
}

export default withRouter(
    connect(
        mapStateToProps,
        mapDispatchToProps
    )(SystemRecommendations)
);