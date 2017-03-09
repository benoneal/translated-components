
# Translated-Components

Pass translated strings as props to components through higher-order components. Compatible with redux and allows language changes to propogate through `shouldComponentUpdate` barriers via the excellent `react-broadcast`. 

## How to use

Five simple steps: 

First, install via `npm i -S translated-components` or `yarn add translated-components`.

Next, string template parsing is handled via the [intl-messageformat library](https://github.com/yahoo/intl-messageformat), which depends on the browser's global I18n API. It's likely you'll need to polyfill this, and the simplest way is to include this script in the head of your rendered HTML: 

```js
// index.html <head>
<script src="https://cdn.polyfill.io/v2/polyfill.min.js" type="text/javascript" />
```

Then wrap everything that you'd like translated in a `TranslationProvider` component, which you pass the currently selected language, and optionally define your default language to use as a fallback for missing translations (if not provided, the default language used is 'en_US'). Example: 

```js
// App.js
render(
  <TranslationProvider language='en_GB' defaultLanguage='en_US'>
    <App />
  </TranslationProvider
, document.findElementById('app'))
```

Next, create a translations object with your supported languages as the primary keys. Two things worth noting: the keys you use for your string templates should map to the props expected by your component, and; your default language should contain the full suite of strings. Example: 

```js
// component/translations.js
export default {
  en_US: {
    title: 'Howdy partner',
    subtitle: '(this is how we say hello)'
  },
  en_GB: {
    title: '\'Ello gov\'na'
  }
}
```

Finally, export your component wrapped in translations!

```js
// component/index.js
import translated from 'translated-component'
import translations from './translations'

const Title = ({title, subtitle}) => (
  <div>
    <h1>{title}</h1>
    <h4>{subtitle}</h4>
  </div>
)

export default translated({translations})(Title)
...js
<Title />
/* -> if current language is set to 'en_GB':
  <div>
    <h1>'Ello gov'na</h1>
    <h4>(this is how we say hello)</h4>
  </div>
*/
```

## Advanced usage

#### Using props as params in template strings

Any props passed to your component are accessible to be referenced as template params in your translation strings. 

```js
const translations = {
  en_US: {
    title: 'Welcome {name}, have some {food}!'
  }
}
const Title = ({title}) => <h1>{title}</h1>
export default translated({translations})(Title)
...
<Title name='Mary' food='cake' />
// -> <h1>Welcome Mary, have some cake!</h1>
```

#### Custom params for template strings

You can specify arbitrary template params by passing in a params object to `translated`. Each param must be a function which will be passed the component's props, and returns a string: 

```js
const translations = {
  en_US: {
    offer: 'It sure is {temperature}, would you like some {drink}?'
  }
}
const params = {
  drink: ({temperature}) => temperature === 'hot' ? 'beer' : 'cocoa'
}
const Offer = ({offer}) => <p>{offer}</p>
export default translated({translations, params})(Offer)
...
<Offer temperature='cold' />
// -> <p>It sure is cold, would you like some cocoa?</p>
```

#### Controlling how translations are passed to components

Sometimes, you may have translations that should only conditionally be passed as props, or which need to be formatted differently. You can control how the translations are passed to your component with a `mapTranslationsToProps` function, which is passed all translated strings, and the component's props, and must return an object. 

```js
const translations = {
  en_US: {
    step_1: 'Steal underpants',
    step_2: '...',
    step_3: 'Profit!'
  }
}
const mapTranslationsToProps = (translations, {steps}) => ({
  steps: steps.map((step) => translations[step])   
})
const Plan = ({steps}) => (
  <ul>{steps.map((step) => <li>{step}</li>)}</ul>
)
export const translated({translations, mapTranslationsToProps})(Plan)
...
<Plan steps={['step_1', 'step_2']} />
/* ->
  <ul>
    <li>Steal underpants</li>
    <li>...</li>
  </ul>
*/
```

#### Displaying money

This lib comes with a built-in `money` number format, which you can use to display currency correctly for the language provided: 

```js
const translations = {
  en_US: {
    label: 'Buy now for {price, number, money}'
  }
}
const BuyButton = ({label}) => <button>{label}</button>
export default translated({translations})(BuyButton)
...
<BuyButton price={14.9536} />
// -> <button>Buy now for $14.95</button>
```

#### User-defined number/date/time formats

Finally, you can pass in custom configuration for intl-messageformat, to define how params are parsed. For example, if this lib didn't provide a money format (which does this for you), you could create a new way to define how money is displayed like so:

```js
const translations = {
  en_US: {
    total: 'Your purchase comes to {price, number, USD}'
  }
}
const format = {
  number: {
    USD: {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }
  }
}
const Total = ({total}) => <p>{total}</p>
export default translated({translations, format})(Total)
...
<Total price={9543.235} />
// -> <p>Your purchase comes to $9,543.23</p>
```
