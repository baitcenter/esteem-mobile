import React, { Fragment } from 'react';
import { SafeAreaView } from 'react-native';
import get from 'lodash/get';

// Components
import { Posts, Header } from '../../../components';

// Container
import { AccountContainer } from '../../../containers';

// Styles
import styles from './feedStyles';

import { POPULAR_FILTERS, POPULAR_FILTERS_VALUE } from '../../../constants/options/filters';

const FeedScreen = () => {
  return (
    <AccountContainer>
      {({ currentAccount }) => (
        <Fragment>
          <Header />
          <SafeAreaView style={styles.container}>
            <Posts
              filterOptions={[...POPULAR_FILTERS]}
              filterOptionsValue={[...POPULAR_FILTERS_VALUE]}
              getFor={get(currentAccount, 'name', null) ? 'feed' : 'hot'}
              selectedOptionIndex={get(currentAccount, 'name', null) ? 0 : 2}
              feedUsername={get(currentAccount, 'name')}
            />
          </SafeAreaView>
        </Fragment>
      )}
    </AccountContainer>
  );
};

export default FeedScreen;
