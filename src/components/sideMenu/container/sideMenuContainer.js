import React, { Component } from 'react';
import { connect } from 'react-redux';

// Actions
import { getUserData } from '../../../realm/realm';

// Constanst
import { default as ROUTES } from '../../../constants/routeNames';

// Component
import { SideMenuView } from '..';

const DEFAULT_IMAGE = require('../../../assets/esteem.png');

/*
  *               Props Name                              Description
  *@props -->     props name navigation                   coming from react-navigation
  *
  */

class SideMenuContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      accounts: [],
    };
  }

  // Component Life Cycle Functions

  componentWillMount() {
    const accounts = [];
    const { currentAccount } = this.props;

    getUserData().then((userData) => {
      userData.forEach((element) => {
        let image = DEFAULT_IMAGE;
        if (Object.keys(currentAccount).length !== 0) {
          const jsonMetadata = JSON.parse(currentAccount.json_metadata);
          if (Object.keys(jsonMetadata).length !== 0) {
            image = jsonMetadata.profile.cover_image;
          }
        }
        accounts.push({ name: `@${element.username}`, image });
      });
      accounts.push({
        name: 'Add Account',
        route: ROUTES.SCREENS.LOGIN,
        icon: 'plus-square-o',
      });
      this.setState({ accounts });
    });
  }

  // Component Functions

  _navigateToRoute = (route = null) => {
    const { navigation } = this.props;
    if (route) {
      navigation.navigate(route);
    }
  };

  render() {
    const { currentAccount, isLoggedIn } = this.props;
    const { accounts } = this.state;

    return (
      <SideMenuView
        navigateToRoute={this._navigateToRoute}
        isLoggedIn={isLoggedIn}
        userAvatar={null}
        accounts={accounts}
        currentAccount={currentAccount}
      />
    );
  }
}

const mapStateToProps = state => ({
  isLoggedIn: state.application.isLoggedIn,
  currentAccount: state.account.currentAccount,
});

export default connect(mapStateToProps)(SideMenuContainer);
