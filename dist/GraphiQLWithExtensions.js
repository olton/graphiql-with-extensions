'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _graphiql = require('graphiql');

var _graphiql2 = _interopRequireDefault(_graphiql);

var _graphiqlExplorer = require('graphiql-explorer');

var _graphiqlExplorer2 = _interopRequireDefault(_graphiqlExplorer);

var _graphiqlCodeExporter = require('graphiql-code-exporter');

var _graphiqlCodeExporter2 = _interopRequireDefault(_graphiqlCodeExporter);

var _graphql = require('graphql');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
//import '../node_modules/graphiql-code-exporter/CodeExporter.css';


var GraphiQLWithExtensions = function (_Component) {
  _inherits(GraphiQLWithExtensions, _Component);

  function GraphiQLWithExtensions() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, GraphiQLWithExtensions);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = GraphiQLWithExtensions.__proto__ || Object.getPrototypeOf(GraphiQLWithExtensions)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
      schema: null,
      query: _this.props.defaultQuery,
      explorerIsOpen: true,
      exporterIsOpen: false,
      disableExplorer: _this.props.disableExplorer,
      disableExporter: _this.props.disableExporter
    }, _this._handleInspectOperation = function (cm, mousePos) {
      var parsedQuery = void 0;
      try {
        parsedQuery = (0, _graphql.parse)(_this.state.query || '');
      } catch (error) {
        console.error('Error parsing query: ', error);
        return;
      }
      if (!parsedQuery) {
        console.error("Couldn't parse query document");
        return null;
      }

      var token = cm.getTokenAt(mousePos);
      var start = { line: mousePos.line, ch: token.start };
      var end = { line: mousePos.line, ch: token.end };
      var position = {
        start: cm.indexFromPos(start),
        end: cm.indexFromPos(end)
      };

      var def = parsedQuery.definitions.find(function (definition) {
        if (!definition.loc) {
          console.log('Missing location information for definition');
          return false;
        }

        var _definition$loc = definition.loc,
            start = _definition$loc.start,
            end = _definition$loc.end;

        return start <= position.start && end >= position.end;
      });

      if (!def) {
        console.error('Unable to find definition corresponding to mouse position');
        return null;
      }

      var operationKind = def.kind === 'OperationDefinition' ? def.operation : def.kind === 'FragmentDefinition' ? 'fragment' : 'unknown';

      var operationName = def.kind === 'OperationDefinition' && Boolean(def.name) ? def.name.value : def.kind === 'FragmentDefinition' && Boolean(def.name) ? def.name.value : 'unknown';

      var selector = '.graphiql-explorer-root #' + operationKind + '-' + operationName;

      var el = document.querySelector(selector);
      el && el.scrollIntoView();
    }, _this._handleEditQuery = function (query) {
      _this.setState({ query: query });
      if (_this.props.onEditQuery) {
        _this.props.onEditQuery(query);
      }
    }, _this._handleEditVariables = function (variables) {
      if (_this.props.onEditVariables) {
        _this.props.onEditVariables(variables);
      }
    }, _this._handleEditOperationName = function (operation) {
      if (_this.props.onEditOperationName) {
        _this.props.onEditOperationName(operation);
      }
    }, _this._handleToggleExplorer = function () {
      _this.setState({ explorerIsOpen: !_this.state.explorerIsOpen });
    }, _this._handleToggleExporter = function () {
      return _this.setState({
        codeExporterIsOpen: !_this.state.codeExporterIsOpen
      });
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(GraphiQLWithExtensions, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this2 = this;

      this.props.fetcher({
        query: (0, _graphql.getIntrospectionQuery)()
      }).then(function (result) {
        var editor = _this2._graphiql.getQueryEditor();
        editor.setOption('extraKeys', _extends({}, editor.options.extraKeys || {}, {
          'Shift-Alt-LeftClick': _this2._handleInspectOperation
        }));

        _this2.setState({ schema: (0, _graphql.buildClientSchema)(result.data) });
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var _this3 = this;

      var _state = this.state,
          query = _state.query,
          schema = _state.schema,
          explorerIsOpen = _state.explorerIsOpen,
          exporterIsOpen = _state.exporterIsOpen;

      var snippets = '',
          serverUrl = '';
      var codeExporter = codeExporterIsVisible ? _react2.default.createElement(_graphiqlCodeExporter2.default, {
        hideCodeExporter: this._handleToggleExporter,
        snippets: snippets,
        serverUrl: serverUrl,
        context: {
          appId: "APP_ID"
        },
        headers: {
          Authorization: 'Bearer AUTH_TOKEN'
        },
        query: query,
        codeMirrorTheme: 'neo'
      }) : null;

      return _react2.default.createElement(
        'div',
        { className: 'graphiql-container' },
        this.props.disableExplorer ? null : _react2.default.createElement(_graphiqlExplorer2.default, {
          schema: schema,
          query: query,
          onEdit: this._handleEditQuery,
          explorerIsOpen: explorerIsOpen,
          exporterIsOpen: exporterIsOpen,
          onToggleExplorer: this._handleToggleExplorer,
          onToggleExporter: this._handleToggleExporter
        }),
        _react2.default.createElement(
          _graphiql2.default,
          {
            ref: function ref(_ref2) {
              return _this3._graphiql = _ref2;
            },
            fetcher: this.props.fetcher,
            schema: schema,
            query: query,
            onEditQuery: this._handleEditQuery,
            onEditVariables: this._handleEditVariables,
            onEditOperationName: this._handleEditOperationName },
          _react2.default.createElement(
            _graphiql2.default.Toolbar,
            null,
            _react2.default.createElement(_graphiql2.default.Button, {
              onClick: function onClick() {
                return _this3._graphiql.handlePrettifyQuery();
              },
              label: 'Prettify',
              title: 'Prettify Query (Shift-Ctrl-P)'
            }),
            _react2.default.createElement(_graphiql2.default.Button, {
              onClick: function onClick() {
                return _this3._graphiql.handleToggleHistory();
              },
              label: 'History',
              title: 'Show History'
            }),
            this.props.disableExplorer ? null : _react2.default.createElement(_graphiql2.default.Button, {
              onClick: this._handleToggleExplorer,
              label: 'Explorer',
              title: 'Toggle Explorer'
            }),
            this.props.disableExporter ? null : _react2.default.createElement(_graphiql2.default.Button, {
              onClick: this._handleToggleExporter,
              label: 'Exporter',
              title: 'Toggle Code Exporter'
            })
          )
        ),
        codeExporter
      );
    }
  }]);

  return GraphiQLWithExtensions;
}(_react.Component);

exports.default = GraphiQLWithExtensions;