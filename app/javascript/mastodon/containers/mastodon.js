import React from 'react';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import configureStore from '../store/configureStore';
import { showOnboardingOnce } from '../actions/onboarding';
import BrowserRouter from 'react-router-dom/BrowserRouter';
import Route from 'react-router-dom/Route';
import ScrollContext from 'react-router-scroll/lib/ScrollBehaviorContext';
import UI from '../features/ui';
import { hydrateStore } from '../actions/store';
import { connectUserStream } from '../actions/streaming';
import { IntlProvider, addLocaleData } from 'react-intl';
import { getLocale } from '../locales';
const { localeData, messages } = getLocale();
addLocaleData(localeData);

export const store = configureStore();
const hydrateAction = hydrateStore(JSON.parse(document.getElementById('initial-state').textContent));
store.dispatch(hydrateAction);

export default class Mastodon extends React.PureComponent {

  static propTypes = {
    locale: PropTypes.string.isRequired,
  };

  componentDidMount() {
    this.disconnect = store.dispatch(connectUserStream());

    // Desktop notifications
    if (typeof window.Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    if (typeof navigator.registerProtocolHandler !== 'undefined') {
      const handlerUrl = window.location.protocol + '//' + window.location.host + '/intent?uri=%s';
      navigator.registerProtocolHandler('web+mastodon', handlerUrl, 'Mastodon');
    }

    store.dispatch(showOnboardingOnce());
  }

  componentWillUnmount () {
    if (this.disconnect) {
      this.disconnect();
      this.disconnect = null;
    }
  }

  render () {
    const { locale } = this.props;

    return (
      <IntlProvider locale={locale} messages={messages}>
        <Provider store={store}>
          <BrowserRouter basename='/web'>
            <ScrollContext>
              <Route path='/' component={UI} />
            </ScrollContext>
          </BrowserRouter>
        </Provider>
      </IntlProvider>
    );
  }

}
