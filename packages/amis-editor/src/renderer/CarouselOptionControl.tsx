/**
 * @file 轮播图选项组件的可视化编辑控件
 */

import React from 'react';
import {findDOMNode} from 'react-dom';
import cx from 'classnames';
import cloneDeep from 'lodash/cloneDeep';
import pickBy from 'lodash/pickBy';
import Sortable from 'sortablejs';

import {FormItem, Button, Icon} from 'amis';
import {TooltipWrapper} from 'amis-ui';
import {render as renderAmis} from 'amis-core';
import {autobind} from 'amis-editor-core';
import {getSchemaTpl} from 'amis-editor-core';
import type {FormControlProps} from 'amis-core';

export type CarouselOptionControlItem = {
  image?: string;
  title?: string;
  description?: string;
  html?: string;
  href?: string;
  htmlTarget?: string;
};

export interface CarouselOptionControlProps extends FormControlProps {}

export interface CarouselOptionControlState {
  options: Array<CarouselOptionControlItem>;
  showDialog: boolean;
  isEdit: boolean;
  modalType: 'image' | 'html';
  modalImage: string;
  modalTitle: string;
  modalDescription: string;
  modalHtml: string;
  modalHref: string;
  modalHrefTarget: string;
  currentIndex: number | undefined;
}

export class CarouselOptionControl extends React.Component<
  CarouselOptionControlProps,
  CarouselOptionControlState
> {
  sortable?: Sortable;
  drag?: HTMLElement | null;

  constructor(props: CarouselOptionControlProps) {
    super(props);

    this.state = {
      options: this.transformOptions(props),
      showDialog: false,
      isEdit: false,
      modalType: 'image',
      modalImage: '',
      modalTitle: '',
      modalDescription: '',
      modalHtml: '',
      modalHref: '',
      modalHrefTarget: '_blank',
      currentIndex: undefined
    };
  }

  transformOptions(props: CarouselOptionControlProps) {
    const {data} = props;
    return Array.isArray(data.options) ? data.options : [];
  }

  /**
   * 更新统一出口
   */
  onChange() {
    const {onBulkChange} = this.props;
    const data: Partial<CarouselOptionControlProps> = {
      options: undefined
    };
    data.options = this.state.options;
    onBulkChange && onBulkChange(data);
    return;
  }

  @autobind
  dragRef(ref: any) {
    if (!this.drag && ref) {
      this.initDragging();
    } else if (this.drag && !ref) {
      this.destroyDragging();
    }

    this.drag = ref;
  }

  initDragging() {
    const dom = findDOMNode(this) as HTMLElement;

    this.sortable = new Sortable(
      dom.querySelector('.ae-CarouselControl-content') as HTMLElement,
      {
        group: 'CarouselOptionControlGroup',
        animation: 150,
        handle: '.ae-CarouselControl-content-item-dragBar',
        ghostClass: 'ae-CarouselControl-content-item--dragging',
        onEnd: (e: any) => {
          // 没有移动
          if (e.newIndex === e.oldIndex) {
            return;
          }

          // 换回来
          const parent = e.to as HTMLElement;
          if (
            e.newIndex < e.oldIndex &&
            e.oldIndex < parent.childNodes.length - 1
          ) {
            parent.insertBefore(e.item, parent.childNodes[e.oldIndex + 1]);
          } else if (e.oldIndex < parent.childNodes.length - 1) {
            parent.insertBefore(e.item, parent.childNodes[e.oldIndex]);
          } else {
            parent.appendChild(e.item);
          }

          const options = this.state.options.concat();

          options[e.oldIndex] = options.splice(
            e.newIndex,
            1,
            options[e.oldIndex]
          )[0];

          this.setState({options}, () => this.onChange());
        }
      }
    );
  }

  destroyDragging() {
    this.sortable && this.sortable.destroy();
  }

  /**
   * 删除选项
   */
  @autobind
  handleDelete(index: number) {
    const options = this.state.options.concat();
    options.splice(index, 1);
    this.setState({options}, () => this.onChange());
  }

  @autobind
  handleUpdate(index: number) {
    const updateItem = this.state.options[index] || {};
    this.setState({
      modalType: updateItem.hasOwnProperty('html') ? 'html' : 'image',
      modalHtml: updateItem.html || '',
      modalImage: updateItem.image || '',
      modalTitle: updateItem.title || '',
      modalDescription: updateItem.description || '',
      modalHref: updateItem.href || '',
      modalHrefTarget: updateItem.htmlTarget || '_blank',
      showDialog: true,
      isEdit: true,
      currentIndex: index
    });
  }

  @autobind
  async handleSubmit() {
    let {
      isEdit,
      modalType,
      modalImage,
      modalHref,
      modalHrefTarget,
      modalTitle,
      modalDescription,
      modalHtml,
      currentIndex
    } = this.state;
    let activeItem: {
      html?: string;
      image?: string;
      title?: string;
      description?: string;
      href?: string;
      htmlTarget?: string;
    } = modalType === 'html'
      ? {html: modalHtml}
      : {
          image: modalImage,
          href: modalHref,
          title: modalTitle,
          description: modalDescription,
          ...(modalHref && modalHrefTarget === '_self' ? {htmlTarget: modalHrefTarget} : {})
      };
    activeItem = pickBy(activeItem);
    const options = cloneDeep(this.state.options);
    if (isEdit && currentIndex !== undefined) {
      options[currentIndex] = activeItem;
    } else {
      options.push(activeItem);
    }
    this.setState({options}, () => this.onChange());
    this.closeModal();
  }

  @autobind
  openModal() {
    this.setState({
      showDialog: true
    });
  }

  @autobind
  closeModal() {
    this.setState({
      showDialog: false,
      isEdit: false,
      modalType: 'image',
      modalImage: '',
      modalHref: '',
      modalHrefTarget: '_blank',
      modalTitle: '',
      modalDescription: '',
      modalHtml: '',
      currentIndex: undefined
    });
  }

  renderHeader() {
    const {
      render,
      label,
      labelRemark,
      useMobileUI,
      env,
      popOverContainer,
    } = this.props;
    const classPrefix = env?.theme?.classPrefix;

    return (
      <header className="ae-CarouselControl-header">
        <label className={cx(`${classPrefix}Form-label`)}>
          {label || ''}
          {labelRemark
            ? render('label-remark', {
                type: 'remark',
                icon: labelRemark.icon || 'warning-mark',
                tooltip: labelRemark,
                className: cx(`Form-lableRemark`, labelRemark?.className),
                useMobileUI,
                container: popOverContainer
                  ? popOverContainer
                  : env && env.getModalContainer
                  ? env.getModalContainer
                  : undefined
              })
            : null}
        </label>
      </header>
    );
  }

  renderOptions(dataSource: CarouselOptionControlItem[]) {
    return (
      <>
        {dataSource.map((option, index: number) => {
          return (
            <div className="ae-CarouselControl-content-item" key={index}>
              <a className="ae-CarouselControl-content-item-dragBar">
                <Icon icon="drag-bar" className="icon" />
              </a>

              <div className="ae-CarouselControl-content-item-label">第{index + 1}项</div>

              <div className="ae-CarouselControl-content-item-actions">
                <TooltipWrapper tooltip="编辑" placement="left">
                  <Icon
                    icon="edit"
                    className="icon"
                    onClick={() => this.handleUpdate(index)}
                  />
                </TooltipWrapper>
                <TooltipWrapper tooltip="删除" placement="left">
                  <Icon
                    icon="trash"
                    className="icon"
                    onClick={() => this.handleDelete(index)}
                  />
                </TooltipWrapper>
              </div>
            </div>
          );
        })}
      </>
    );
  }

  renderDialog() {
    const {
      modalType,
      modalImage,
      modalHref,
      modalHrefTarget,
      modalTitle,
      modalDescription,
      modalHtml,
      isEdit
    } = this.state;
    return renderAmis(
      {
        type: 'dialog',
        title: isEdit ? '编辑轮播面板' : '添加轮播面板',
        body: {
          type: 'form',
          mode: 'horizontal',
          labelAlign: 'left',
          labelWidth: 84,
          wrapperComponent: 'div',
          actions: [],
          body: [
            {
              label: '类型',
              name: 'modalType',
              type: 'button-group-select',
              options: [
                {
                  label: '图片',
                  value: 'image'
                },
                {
                  label: '富文本',
                  value: 'html'
                }
              ],
              onChange: (value: 'image' | 'html') => {
                this.setState({modalType: value});
              }
            },
            getSchemaTpl('imageUrl', {
              name: 'modalImage',
              visibleOn: 'this.modalType == "image"',
              onChange: (value: string) => {
                this.setState({modalImage: value});
              }
            }),
            getSchemaTpl('imageTitle', {
              name: 'modalTitle',
              visibleOn: 'this.modalType == "image"',
              onChange: (value: string) => {
                this.setState({modalTitle: value});
              }
            }),
            getSchemaTpl('imageDesc', {
              name: 'modalDescription',
              visibleOn: 'this.modalType == "image"',
              onChange: (value: string) => {
                this.setState({modalDescription: value});
              }
            }),
            {
              type: 'input-text',
              label: '外链地址',
              name: 'modalHref',
              visibleOn: 'this.modalType == "image"',
              onChange: (value: string) => {
                this.setState({modalHref: value});
              }
            },
            {
              type: 'radios',
              label: '打开外链方式',
              name: 'modalHrefTarget',
              options: [
                {
                  label: '新标签页打开',
                  value: '_blank'
                },
                {
                  label: '当前页打开',
                  value: '_self'
                }
              ],
              visibleOn: 'this.modalType == "image"',
              onChange: (value: string) => {
                this.setState({modalHrefTarget: value});
              }
            },
            getSchemaTpl('richText', {
              label: '内容',
              name: 'modalHtml',
              visibleOn: 'this.modalType == "html"',
              onChange: (value: string) => {
                this.setState({modalHtml: value});
              }
            })
          ]
        }
      },
      {
        data: {
          modalType,
          modalImage,
          modalHref,
          modalHrefTarget,
          modalTitle,
          modalDescription,
          modalHtml
        },
        onClose: this.closeModal,
        onConfirm: this.handleSubmit
      }
    );
  }

  render() {
    const {options, showDialog} = this.state;
    const {className} = this.props;
    return (
      <div className={cx('ae-CarouselControl', className)}>
        {this.renderHeader()}

        <div className="ae-CarouselControl-wrapper">
            {Array.isArray(options) && options.length ? (
              <div className="ae-CarouselControl-content" ref={this.dragRef}>
                {this.renderOptions(options)}
              </div>
            ) : (
              <div className="ae-CarouselControl-placeholder">无选项</div>
            )}
            <div className="ae-CarouselControl-footer">
              <Button level="enhance" onClick={this.openModal}>
                <Icon icon="plus" className="icon" />
                添加
              </Button>
            </div>
          </div>

        {showDialog && this.renderDialog()}
      </div>
    );
  }
}

@FormItem({
  type: 'ae-carouselOptionControl',
  renderLabel: false
})
export class CarouselOptionControlRenderer extends CarouselOptionControl {}
