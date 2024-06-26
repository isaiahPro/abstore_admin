import { useState } from "react";

import { useMutation } from "@tanstack/react-query";
import { Button, Modal, Input, Form, notification } from "antd";

import useAdminStore from "../../store/Admin";
import { adminChangePassword } from "../../api/admin";

const { useNotification } = notification;

const ModalButton = () => {
  const [open, setOpen] = useState(false);
  const [api, contextHolder] = useNotification();
  const admin = useAdminStore((state) => state.admin);

  const { mutate, isPending } = useMutation({
    mutationFn: adminChangePassword,
    onSuccess: (response) => {
      showNotification("success", response.message);
      setOpen(false);
    },
    onError: (error) => {
      showNotification("error", error.message);
    },
  });

  function showNotification(message: "success" | "error", description: string) {
    api[message]({
      message: message.toUpperCase(),
      description,
    });
  }

  const onCreate = (values: Values) => {
    mutate({ id: admin ? admin.id : "", ...values });
  };

  return (
    <div>
      {contextHolder}
      <Button
        onClick={() => {
          setOpen(true);
        }}
      >
        Change Password
      </Button>
      <PasswordForm
        open={open}
        isPending={isPending}
        onCreate={onCreate}
        onCancel={() => {
          setOpen(false);
        }}
      />
    </div>
  );
};

export default ModalButton;
interface Values {
  password: string;
  confirmPassword: string;
}

interface IPasswordFormProps {
  open: boolean;
  isPending: boolean;
  onCreate: (values: Values) => void;
  onCancel: () => void;
}

const PasswordForm: React.FC<IPasswordFormProps> = ({
  open,
  isPending,
  onCreate,
  onCancel,
}) => {
  const [form] = Form.useForm();

  return (
    <Modal
      open={open}
      title="Change Password"
      okText="Change"
      cancelText="Cancel"
      onCancel={onCancel}
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            form.resetFields();
            onCreate(values);
          })
          .catch((info) => {
            console.log("Validate Failed:", info);
          });
      }}
      okButtonProps={{ disabled: isPending, loading: isPending }}
    >
      <Form form={form} layout="vertical" name="invitation">
        <Form.Item
          name="password"
          label="Password"
          rules={[
            {
              required: true,
              message: "Please input the password!",
            },
            {
              pattern: /[a-z]/,
              message: "Password should contain lowercase letter!",
            },
            {
              pattern: /[A-Z]/,
              message: "Password should contain uppercase letter!",
            },
            {
              pattern: /\d/,
              message: "Password should contain number!",
            },
            {
              pattern: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/,
              message: "Password should special character!",
            },
            { min: 8, message: "Password should be min of eight character!" },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          label="Confirm Password"
          rules={[
            {
              required: true,
              message: "Please input the confirm password!",
            },
            {
              validator: (_: any, value: string, callback: any) => {
                if (value && value !== form.getFieldValue("password")) {
                  callback("Confirm password don't match with password!");
                } else {
                  callback();
                }
              },
            },
          ]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};
