<?php
/**
 * CodeMirror plugin for DokuWiki
 *
 * @author Albert Gasset <albertgasset@fsfe.org>
 * @license GNU GPL version 2 or later
 */

if(!defined('DOKU_INC')) die();

require_once DOKU_INC . 'inc/parser/parser.php';

class action_plugin_codemirror extends DokuWiki_Action_Plugin {

    static $actions = array('edit', 'create', 'source', 'preview',
                            'locked', 'draft', 'recover', 'show');

    public function register(Doku_Event_Handler $controller) {
        $controller->register_hook('TPL_METAHEADER_OUTPUT', 'BEFORE',
                                   $this, 'handle_tpl_metaheader_output');
    }

    public function handle_tpl_metaheader_output(Doku_Event &$event, $param) {
        global $ACT, $INFO, $conf;

        if ($ACT == 'show' and !$this->getConf('codesyntax')) {
            return;
        }

        if (!in_array($ACT, self::$actions)) {
            return;
        }

        $info = $this->getInfo();
        $version = str_replace('-', '', $info['date']);
        $base_url = DOKU_BASE . 'lib/plugins/codemirror';
        $mode_acronym = new Doku_Parser_Mode_acronym(array_keys(getAcronyms()));

        $jsinfo = array(
            'acronyms' => $mode_acronym->acronyms,
            'baseURL' => $base_url,
            'camelcase' => (bool) $conf['camelcase'],
            'codesyntax' => $this->getConf('codesyntax'),
            'entities' => array_keys(getEntities()),
            'iconURL' => "$base_url/settings.png",
            'nativeeditor' => $this->getConf('nativeeditor'),
            'schemes' => array_values(getSchemes()),
            'smileys' => array_keys(getSmileys()),
            'version' => $version,
            'usenativescroll' => $this->getConf('usenativescroll'),
        );

        $event->data['link'][] = array(
            'rel' => 'stylesheet',
            'type' => 'text/css',
            'href' => "$base_url/dist/styles.min.css?v=$version",
        );

        $event->data['script'][] = array(
            'type' => 'text/javascript',
            '_data' => 'JSINFO.plugin_codemirror = ' . json_encode($jsinfo),
        );

        $event->data['script'][] = array(
            'type' => 'text/javascript',
            'charset' => 'utf-8',
            'src' => "$base_url/dist/scripts.min.js?v=$version",
        );
    }
}
