<script>
import { deepClone } from "@/utils/index";
import render from "@/components/render/render.js";

const ruleTrigger = {
  "el-input": "blur",
  "el-input-number": "blur",
  "el-select": "change",
  "el-radio-group": "change",
  "el-checkbox-group": "change",
  "el-cascader": "change",
  "el-time-picker": "change",
  "el-date-picker": "change",
  "el-rate": "change",
};

const layouts = {
  colFormItem(h, scheme) {
    const config = scheme.__config__;
    const listeners = buildListeners.call(this, scheme);

    let labelWidth = config.labelWidth ? `${config.labelWidth}px` : null;
    if (config.showLabel === false) labelWidth = "0";
    if (scheme.visiable)
      return (
      <el-col span={config.span}>
        <el-form-item
          label-width={labelWidth}
          prop={scheme.__vModel__}
          label={config.showLabel ? config.label : ""}
        >
          <render conf={scheme} {...{ on: listeners }} />
        </el-form-item>
      </el-col>
    );
  },
  rowFormItem(h, scheme) {
    let child = renderChildren.apply(this, arguments);
    if (scheme.type === "flex") {
      child = (
        <el-row
          type={scheme.type}
          justify={scheme.justify}
          align={scheme.align}
        >
          {child}
        </el-row>
      );
    }
    return (
      <el-col span={scheme.span}>
        <el-row gutter={scheme.gutter}>{child}</el-row>
      </el-col>
    );
  },
};

function visiableCondition(visiable, condition) {
  if (visiable) {
    return visiable;
  } else {
    if (condition == "true") {
      return true;
    }
  }
}

function renderFrom(h) {
  const { formConfCopy } = this;

  return (
    <el-row gutter={formConfCopy.gutter}>
      <el-form
        size={formConfCopy.size}
        label-position={formConfCopy.labelPosition}
        disabled={formConfCopy.disabled}
        label-width={`${formConfCopy.labelWidth}px`}
        ref={formConfCopy.formRef}
        // model不能直接赋值 https://github.com/vuejs/jsx/issues/49#issuecomment-472013664
        props={{ model: this[formConfCopy.formModel] }}
        rules={this[formConfCopy.formRules]}
      >
        {renderFormItem.call(this, h, formConfCopy.fields)}
        {formConfCopy.formBtns && formBtns.call(this, h)}
      </el-form>
    </el-row>
  );
}

function formBtns(h) {
  return (
    <el-col>
      <el-form-item size="large">
        <el-button type="primary" onClick={this.submitForm}>
          提交
        </el-button>
        <el-button onClick={this.resetForm}>重置</el-button>
      </el-form-item>
    </el-col>
  );
}

function renderFormItem(h, elementList) {
  return elementList.map((scheme) => {
    const config = scheme.__config__;
    const layout = layouts[config.layout];
    if (layout) {
      return layout.call(this, h, scheme);
    }
    throw new Error(`没有与${config.layout}匹配的layout`);
  });
}

function renderChildren(h, scheme) {
  const config = scheme.__config__;
  if (!Array.isArray(config.children)) return null;
  return renderFormItem.call(this, h, config.children);
}

function setValue(event, config, scheme) {
  this.$set(config, "defaultValue", event);
  this.$set(this[this.formConf.formModel], scheme.__vModel__, event); //向formModel中添加对应的__vModel__
  associatedControl.call(this, event, scheme.__vModel__); //获取内容刚刚改变的控件的值和vModel
}

function associatedControl(event, vModel) {
  //查找关联控件的条件
  const elementList = this.formConfCopy.fields;
  elementList.map((scheme, index) => {
    const condition = scheme.visiableCondition;
    const or = condition.or; //包含或条件的数组
    const and = condition.and; //包含且条件的数组

    let orList = [];
    let andList = [];
    if (or.length > 0) {
      orList = or.map((item) => {
        const count = conditionJudge.call(this, item, event, vModel);
        // console.log(count);
        if (count && count == true) {
          item.visiable = true;
          return item.visiable;
        } else {
          item.visiable = false;
          return item.visiable;
        }
      });
    }
    if (and.length > 0) {
      andList = and.map((item) => {
        const count = conditionJudge.call(this, item, event, vModel);
        if (count && count == true) {
          // elementList[index].visiable = true;
          // this.formConfCopy.fields = elementList;
          item.visiable = true;
          return item.visiable;
        } else {
          item.visiable = false;
          return item.visiable;
        }
      });
    }

    if (orList.length > 0 || andList.length > 0) {
      let ors
      if (orList.length > 0) {
        ors = orList.includes(true);
      }else{
        ors = true
      }
      // const ors = orList.includes(true);

      const ands = andList.every((item) => {
        return item == true;
      });

      // console.log(ors,ands);

      if (ors == true && ands == true) {
        elementList[index].visiable = true;
        this.formConfCopy.fields = elementList;
      } else {
        elementList[index].visiable = false;
        this.formConfCopy.fields = elementList;
      }
    }
  });
}

function conditionJudge(item, event, vModel) {
  const formModel = this[this.formConfCopy.formModel]; //获取form表单数据
  const events = formModel[item.id];    //
  if (events != undefined) {
    //判断formModel中是否有当前属性
    if (item.type == "equalto") {
      //条件类型
      if (item.content == events) {
        //条件值
        return true;
      } else {
        return false;
      }
    } else if (item.type == "greaterequal") {
      //条件类型
      if (item.content <= events) {
        //条件值
        return true;
      } else {
        return false;
      }
    } else if (item.type == "greaterthan") {
      //条件类型
      if (item.content < events) {
        //条件值
        return true;
      } else {
        return false;
      }
    } else if (item.type == "lessthan") {
      //条件类型
      if (item.content > events) {
        //条件值
        return true;
      } else {
        return false;
      }
    } else if (item.type == "lessequal") {
      //条件类型
      if (item.content >= events) {
        //条件值
        return true;
      } else {
        return false;
      }
    }
  } else {
    console.error("没有找到属性"+item.id+ "或该属性的初始值为空值！");
  }
}

function buildListeners(scheme) {
  const config = scheme.__config__;
  const methods = this.formConf.__methods__ || {};
  const listeners = {};

  // 给__methods__中的方法绑定this和event
  Object.keys(methods).forEach((key) => {
    listeners[key] = (event) => methods[key].call(this, event);
  });
  // 响应 render.js 中的 vModel $emit('input', val)
  listeners.input = (event) => setValue.call(this, event, config, scheme);

  return listeners;
}

export default {
  components: {
    render,
  },
  props: {
    formConf: {
      type: Object,
      required: true,
    },
  },
  data() {
    const data = {
      formConfCopy: deepClone(this.formConf),
      [this.formConf.formModel]: {},
      [this.formConf.formRules]: {},
    };
    this.initFormData(data.formConfCopy.fields, data[this.formConf.formModel]);
    this.buildRules(data.formConfCopy.fields, data[this.formConf.formRules]);
    return data;
  },
  methods: {
    initFormData(componentList, formData) {
      componentList.forEach((cur) => {
        const config = cur.__config__;
        if (cur.__vModel__) formData[cur.__vModel__] = config.defaultValue;
        if (config.children) this.initFormData(config.children, formData);
      });
    },
    buildRules(componentList, rules) {
      componentList.forEach((cur) => {
        const config = cur.__config__;
        if (Array.isArray(config.regList)) {
          if (config.required) {
            const required = {
              required: config.required,
              message: cur.placeholder,
            };
            if (Array.isArray(config.defaultValue)) {
              required.type = "array";
              required.message = `请至少选择一个${config.label}`;
            }
            required.message === undefined &&
              (required.message = `${config.label}不能为空`);
            config.regList.push(required);
          }
          rules[cur.__vModel__] = config.regList.map((item) => {
            item.pattern && (item.pattern = eval(item.pattern));
            item.trigger = ruleTrigger && ruleTrigger[config.tag];
            return item;
          });
        }
        if (config.children) this.buildRules(config.children, rules);
      });
    },
    resetForm() {
      this.formConfCopy = deepClone(this.formConf);
      this.$refs[this.formConf.formRef].resetFields();
      console.log(this.formConf)
    },
    submitForm() {
      this.$refs[this.formConf.formRef].validate((valid) => {
        if (!valid) return false;
        // 触发sumit事件
        this.$emit("submit", this[this.formConf.formModel]);
        return true;
      });
    },
  },
  render(h) {
    return renderFrom.call(this, h);
  },
};
</script>
