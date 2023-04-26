import {registerEditorPlugin} from 'amis-editor-core';
import {BaseEventContext, BasePlugin, BasicToolbarItem} from 'amis-editor-core';
import {defaultValue, getSchemaTpl} from 'amis-editor-core';
import {mockValue} from 'amis-editor-core';
import cloneDeep from 'lodash/cloneDeep';

export class CarouselPlugin extends BasePlugin {
  // 关联渲染器名字
  rendererName = 'carousel';
  $schema = '/schemas/CarouselSchema.json';

  // 组件名称
  name = '轮播图';
  isBaseComponent = true;
  description =
    '用来渲染轮播图，可以配置每一页的内容（不只是图片），可以配置过渡动画。';
  docLink = '/amis/zh-CN/components/carousel';
  tags = ['展示'];
  icon = 'fa fa-images';
  pluginIcon = 'carousel-plugin';
  scaffold = {
    type: 'carousel',
    options: [
      {
        image: mockValue({type: 'image'})
      },
      {
        html: '<div style="width: 100%; height: 300px; background: #e3e3e3; text-align: center; line-height: 300px;">carousel data</div>'
      },
      {
        image: mockValue({type: 'image'})
      }
    ]
  };
  previewSchema = {
    ...this.scaffold
  };

  panelTitle = '轮播图';
  panelJustify = true;
  panelBodyCreator = (context: BaseEventContext) => {
    const isUnderField = /\/field\/\w+$/.test(context.path as string);
    return [
      getSchemaTpl('tabs', [
        {
          title: '属性',
          body: getSchemaTpl('collapseGroup', [
            {
              title: '基本',
              body: [
                getSchemaTpl('layout:originPosition', {value: 'left-top'}),
                isUnderField
                  ? {
                      type: 'tpl',
                      inline: false,
                      className: 'text-info text-sm',
                      tpl: '<p>当前为字段内容节点配置，选择上层还有更多的配置。</p>'
                    }
                  : null,
                {
                  type: 'formula',
                  name: '__mode',
                  autoSet: false,
                  formula:
                    '!this.name && !this.source && Array.isArray(this.options) ? 2 : 1'
                },
                {
                  label: '数据源',
                  name: '__mode',
                  type: 'button-group-select',
                  options: [
                    {
                      label: '关联字段',
                      value: 1
                    },
                    {
                      label: '静态设置',
                      value: 2
                    }
                  ],
                  pipeIn: (value: any, {data}: any) => {
                    if (value === undefined) {
                      return !data.name &&
                        !data.source &&
                        Array.isArray(data.options)
                        ? 2
                        : 1;
                    }
                    return value;
                  }
                },
                {
                  label: '字段名',
                  name: 'name',
                  type: 'input-text',
                  description: '设置字段名，关联当前数据作用域中的数据。',
                  visibleOn:
                    'this.__mode == 1 || !this.__mode && (this.name || this.source || !Array.isArray(this.options))'
                },
                getSchemaTpl('carouselOptionControl', {
                  label: '轮播面板数据',
                  visibleOn:
                    'this.__mode == 2 || !this.__mode && !this.name && !this.source && Array.isArray(this.options)'
                }),
                getSchemaTpl('switch', {
                  name: 'auto',
                  label: '自动轮播',
                  pipeIn: defaultValue(true)
                }),
                getSchemaTpl('valueFormula', {
                  rendererSchema: {
                    type: 'input-number'
                  },
                  name: 'interval',
                  label: '动画间隔(ms)',
                  valueType: 'number',
                  clearValueOnHidden: true,
                  pipeIn: defaultValue(5000),
                  hiddenOn: 'this.auto === false'
                }),
                {
                  name: 'duration',
                  type: 'input-number',
                  label: '动画时长(ms)',
                  min: 100,
                  step: 10,
                  pipeIn: defaultValue(500)
                },
                {
                  name: 'animation',
                  label: '动画效果',
                  type: 'button-group-select',
                  size: 'sm',
                  pipeIn: defaultValue('fade'),
                  options: [
                    {
                      label: 'fade',
                      value: 'fade'
                    },
                    {
                      label: 'slide',
                      value: 'slide'
                    }
                  ]
                },
                {
                  type: 'ae-switch-more',
                  bulk: true,
                  mode: 'normal',
                  name: 'multiple',
                  label: '多图展示',
                  formType: 'extend',
                  form: {
                    body: [
                      {
                        name: 'multiple.count',
                        label: '数量',
                        type: 'input-number',
                        min: 2,
                        step: 1
                      }
                    ]
                  }
                }
              ]
            },
            getSchemaTpl('status')
          ])
        },
        {
          title: '外观',
          body: getSchemaTpl('collapseGroup', [
            {
              title: '基本',
              body: [
                {
                  name: 'controlsTheme',
                  label: '切换按钮主题',
                  type: 'button-group-select',
                  pipeIn: defaultValue('light'),
                  options: [
                    {
                      label: 'light',
                      value: 'light'
                    },
                    {
                      label: 'dark',
                      value: 'dark'
                    }
                  ]
                },
                {
                  name: 'controls',
                  label: '切换方式选择',
                  type: 'checkboxes',
                  optionType: 'button',
                  pipeIn: defaultValue('dots,arrows'),
                  options: [
                    {
                      label: '底部圆点',
                      value: 'dots'
                    },
                    {
                      label: '左右箭头',
                      value: 'arrows'
                    }
                  ]
                },
                getSchemaTpl('switch', {
                  name: 'alwaysShowArrow',
                  label: '箭头一直显示',
                  clearValueOnHidden: true,
                  hiddenOn: '!~this.controls.indexOf("arrows")',
                  pipeIn: defaultValue(false)
                }),
                {
                  name: 'width',
                  type: 'input-text',
                  label: '宽度',
                  validations: 'isNumeric',
                  addOn: {
                    type: 'button',
                    label: 'px'
                  }
                },
                {
                  name: 'height',
                  type: 'input-text',
                  label: '高度',
                  validations: 'isNumeric',
                  addOn: {
                    type: 'button',
                    label: 'px'
                  }
                }
              ]
            },
            {
              title: 'CSS类名',
              body: [
                getSchemaTpl('className', {
                  autoComplete: false,
                  label: '外层'
                }),
                getSchemaTpl('className', {
                  name: '__titleClassName',
                  label: '图片标题',
                  onChange: (
                    value: any,
                    oldValue: any,
                    model: any,
                    form: any
                  ) => {
                    let newOptions = cloneDeep(form.getValueByName('options'));
                    if (Array.isArray(newOptions) && newOptions.length) {
                      newOptions.forEach(item => {
                        if (item.hasOwnProperty('image')) {
                          if (value) {
                            item.titleClassName = value;
                          } else {
                            item.hasOwnProperty('titleClassName') &&
                              delete item.titleClassName;
                          }
                        }
                      });
                      form.setValueByName('options', newOptions);
                    }
                  }
                }),
                getSchemaTpl('className', {
                  name: '__descriptionClassName',
                  label: '图片描述',
                  onChange: (
                    value: any,
                    oldValue: any,
                    model: any,
                    form: any
                  ) => {
                    let newOptions = cloneDeep(form.getValueByName('options'));
                    if (Array.isArray(newOptions) && newOptions.length) {
                      newOptions.forEach(item => {
                        if (item.hasOwnProperty('image')) {
                          if (value) {
                            item.descriptionClassName = value;
                          } else {
                            item.hasOwnProperty('descriptionClassName') &&
                              delete item.descriptionClassName;
                          }
                        }
                      });
                      form.setValueByName('options', newOptions);
                    }
                  }
                })
              ]
            }
          ])
        }
      ])
    ];
  };

  filterProps(props: any) {
    // 编辑的时候别自动轮播，影响编辑
    props.auto = false;
    return props;
  }

  /**
   * 补充切换的 toolbar
   * @param context
   * @param toolbars
   */
  buildEditorToolbar(
    context: BaseEventContext,
    toolbars: Array<BasicToolbarItem>
  ) {
    if (
      context.info.plugin === this &&
      context.info.renderer.name === 'carousel' &&
      !context.info.hostId
    ) {
      const node = context.node;

      toolbars.push({
        level: 'secondary',
        icon: 'fa fa-chevron-left',
        tooltip: '上个卡片',
        onClick: () => {
          const control = node.getComponent();
          control?.prev?.();
        }
      });

      toolbars.push({
        level: 'secondary',
        icon: 'fa fa-chevron-right',
        tooltip: '下个卡片',
        onClick: () => {
          const control = node.getComponent();

          control?.next?.();
        }
      });
    }
  }
}

registerEditorPlugin(CarouselPlugin);
